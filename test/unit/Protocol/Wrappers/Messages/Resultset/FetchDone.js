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

const expect = require('chai').expect;
const td = require('testdouble');

// subject under test needs to be reloaded with replacement fakes
let fetchDone = require('../../../../../../lib/Protocol/Wrappers/Messages/Resultset/FetchDone');

describe('Mysqlx.Resultset.FetchDone wrapper', () => {
    let ResultsetStub, bytes, empty, wraps;

    beforeEach('create fakes', () => {
        ResultsetStub = td.replace('../../../../../../lib/Protocol/Stubs/mysqlx_resultset_pb');
        bytes = td.replace('../../../../../../lib/Protocol/Wrappers/ScalarValues/bytes');
        empty = td.replace('../../../../../../lib/Protocol/Wrappers/Traits/Empty');
        wraps = td.replace('../../../../../../lib/Protocol/Wrappers/Traits/Wraps');
        fetchDone = require('../../../../../../lib/Protocol/Wrappers/Messages/Resultset/FetchDone');
    });

    afterEach('reset fakes', () => {
        td.reset();
    });

    context('class methods', () => {
        context('deserialize()', () => {
            it('returns a Mysqlx.Resultset.FetchDone wrap instance encoded with raw protocol data from the network', () => {
                td.when(bytes.deserialize('foo')).thenReturn({ valueOf: () => 'baz' });
                td.when(ResultsetStub.FetchDone.deserializeBinary('baz')).thenReturn('qux');
                td.when(wraps('qux')).thenReturn({ valueOf: () => 'bar' });

                expect(fetchDone.deserialize('foo').valueOf()).to.equal('bar');
            });
        });
    });

    context('instance methods', () => {
        context('toJSON()', () => {
            it('returns a textual representation of a Mysqlx.Resultset.FetchDone message', () => {
                const proto = new ResultsetStub.FetchDone();

                td.when(empty(proto)).thenReturn({ toJSON: () => 'foo' });

                expect(fetchDone(proto).toJSON()).to.equal('foo');
            });
        });

        context('valueOf()', () => {
            it('returns the underlying protobuf stub instance', () => {
                const proto = new ResultsetStub.FetchDone();

                td.when(wraps(proto)).thenReturn({ valueOf: () => 'foo' });

                expect(fetchDone(proto).valueOf()).to.equal('foo');
            });
        });
    });
});
