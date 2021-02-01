/*
 * Copyright (c) 2020, 2021, Oracle and/or its affiliates.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License, version 2.0, as
 * published by the Free Software Foundation.
 *
 * This program is also distributed with certain software (including
 * but not limited to OpenSSL) that is licensed under separate terms,
 * as designated in a particular file or component or in included license
 * documentation.  The authors of MySQL hereby grant you an
 * additional permission to link the program and your derivative works
 * with the separately licensed software that they have included with
 * MySQL.
 *
 * Without limiting anything contained in the foregoing, this file,
 * which is part of MySQL Connector/Node.js, is also subject to the
 * Universal FOSS Exception, version 1.0, a copy of which can be found at
 * http://oss.oracle.com/licenses/universal-foss-exception.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License, version 2.0, for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin St, Fifth Floor, Boston, MA 02110-1301  USA
 */

'use strict';

/* eslint-env node, mocha */

const config = require('../../../config');
const expect = require('chai').expect;
const fixtures = require('../../../fixtures');
const mysqlx = require('../../../../');

describe('deleting data from a table', () => {
    let session, schema, table;

    beforeEach('create default schema', () => {
        return fixtures.createSchema(config.schema);
    });

    beforeEach('create session using default schema', () => {
        return mysqlx.getSession(config)
            .then(s => {
                session = s;
            });
    });

    beforeEach('load default schema', () => {
        schema = session.getSchema(config.schema);
    });

    beforeEach('create table', () => {
        return session.sql(`CREATE TABLE test (
            name VARCHAR(255),
            age INT)`).execute();
    });

    beforeEach('load table', () => {
        table = schema.getTable('test');
    });

    beforeEach('add fixtures', () => {
        return schema
            .getTable('test')
            .insert(['name', 'age'])
            .values(['foo', 42])
            .values(['bar', 23])
            .values(['baz', 42])
            .execute();
    });

    afterEach('drop default schema', () => {
        return session.dropSchema(config.schema);
    });

    afterEach('close session', () => {
        return session.close();
    });

    context('with truthy condition', () => {
        it('removes all rows from a table without using `where()`', () => {
            const actual = [];

            return table.delete()
                .where('true')
                .execute()
                .then(() => table.select().execute(row => actual.push(row)))
                .then(() => expect(actual).to.be.empty);
        });

        it('removes all rows from a table using `where()`', () => {
            const actual = [];

            return table.delete()
                .where('true')
                .execute()
                .then(() => table.select().execute(row => actual.push(row)))
                .then(() => expect(actual).to.be.empty);
        });

        it('fails when no filtering criteria is provided with `where()`', () => {
            return table.delete()
                .where()
                .execute()
                .then(() => expect.fail())
                .catch(err => expect(err.message).to.equal('An explicit criteria needs to be provided using where().'));
        });
    });

    context('with filtering condition', () => {
        it('removes the rows from a table that match the criteria defined without `where()`', () => {
            const expected = [['bar', 23], ['baz', 42]];
            const actual = [];

            return table.delete()
                .where('name = "foo"')
                .execute()
                .then(() => {
                    return table
                        .select()
                        .orderBy('name')
                        .execute(row => actual.push(row));
                })
                .then(() => expect(actual).to.deep.equal(expected));
        });

        it('removes the rows from a table that match the criteria defined with `where()`', () => {
            const expected = [['bar', 23]];
            const actual = [];

            return table.delete()
                .where('age = 42')
                .execute()
                .then(() => table.select().execute(row => actual.push(row)))
                .then(() => expect(actual).to.deep.equal(expected));
        });

        it('removes the rows from a table that match a bindable criteria without `where()`', () => {
            const expected = [['bar', 23], ['baz', 42]];
            const actual = [];

            return table.delete()
                .where('name = :name AND age = :age')
                .bind('age', 42)
                .bind('name', 'foo')
                .execute()
                .then(() => table.select().orderBy('name').execute(row => actual.push(row)))
                .then(() => expect(actual).to.deep.equal(expected));
        });

        it('removes the rows from a table that match a bindable criteria with `where()`', () => {
            const expected = [['bar', 23]];
            const actual = [];

            return table.delete()
                .where('name = :name')
                .where('age = :age')
                // name will be ignored, since the criteria is replaced
                .bind({ name: 'foo', age: 42 })
                .execute()
                .then(() => table.select().execute(row => actual.push(row)))
                .then(() => expect(actual).to.deep.equal(expected));
        });
    });

    context('with limit', () => {
        it('deletes a given number of rows', () => {
            const expected = [['foo', 42]];
            const actual = [];

            return table.delete()
                .where('true')
                .limit(2)
                .orderBy('name')
                .execute()
                .then(() => table.select().execute(row => actual.push(row)))
                .then(() => expect(actual).to.deep.equal(expected));
        });
    });

    context('multi-option expressions', () => {
        it('returns all documents that match a criteria specified by a grouped expression', () => {
            const expected = [];
            const actual = [];

            return table.delete()
                .where("name in ('foo', 'bar', 'baz')")
                .execute()
                .then(() => table.select().execute(row => actual.push(row)))
                .then(() => expect(actual).to.deep.equal(expected));
        });

        it('returns all documents that do not match a criteria specified by a grouped expression', () => {
            const expected = [['bar', 23], ['baz', 42], ['foo', 42]];
            const actual = [];

            return table.delete()
                .where('age not in (23, 42)')
                .execute()
                .then(() => table.select().orderBy('name').execute(row => actual.push(row)))
                .then(() => expect(actual).to.deep.equal(expected));
        });
    });

    context('BUG#30401962 affected items', () => {
        context('without limit', () => {
            it('returns the number of rows that have been deleted from the table', () => {
                return table.delete()
                    .where('true')
                    .execute()
                    .then(res => expect(res.getAffectedItemsCount()).to.equal(3));
            });
        });

        context('with limit', () => {
            it('returns the number of rows that have been deleted from the table', () => {
                const limit = 2;

                return table.delete()
                    .where('true')
                    .limit(limit)
                    .execute()
                    .then(res => expect(res.getAffectedItemsCount()).to.equal(limit));
            });
        });
    });
});
