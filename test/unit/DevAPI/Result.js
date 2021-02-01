/*
 * Copyright (c) 2018, 2021, Oracle and/or its affiliates.
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

const expect = require('chai').expect;
const result = require('../../../lib/DevAPI/Result');

describe('Result', () => {
    context('getAffectedItemsCount()', () => {
        it('returns the same result as getAffectedRowsCount()', () => {
            expect(result({ rowsAffected: 3 }).getAffectedItemsCount()).to.equal(3);
        });
    });

    context('getAutoIncrementValue()', () => {
        it('returns the first value generated by "AUTO INCREMENT" for a given operation', () => {
            expect(result({ generatedInsertId: 1 }).getAutoIncrementValue()).to.equal(1);
        });
    });

    context('getGeneratedIds()', () => {
        it('returns the list of document ids generated by the server for a given operation', () => {
            const generatedDocumentIds = ['foo', 'bar'];

            expect(result({ generatedDocumentIds }).getGeneratedIds()).to.deep.equal(generatedDocumentIds);
        });
    });

    context('getWarnings()', () => {
        it('returns the list of warnings generated by the server for a given operation', () => {
            const warnings = ['foo', 'bar'];

            expect(result({ warnings }).getWarnings()).to.deep.equal(warnings);
        });
    });

    context('getWarningsCount()', () => {
        it('returns the number of warnings generated by the server for a given operation', () => {
            const warnings = ['foo', 'bar', 'baz'];

            expect(result({ warnings }).getWarningsCount()).to.deep.equal(3);
        });
    });
});
