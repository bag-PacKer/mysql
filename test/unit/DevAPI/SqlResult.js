'use strict';

/* eslint-env node, mocha */

const expect = require('chai').expect;
const sqlResult = require('../../../lib/DevAPI/SqlResult');
const td = require('testdouble');

describe('SqlResult', () => {
    let toArray;

    beforeEach('create fakes', () => {
        toArray = td.function();
    });

    afterEach('reset fakes', () => {
        td.reset();
    });

    context('fetchAll()', () => {
        it('returns an empty array when there are no items in the result set', () => {
            expect(sqlResult().fetchAll()).to.deep.equal([]);
            expect(sqlResult({ results: undefined }).fetchAll()).to.deep.equal([]);
            expect(sqlResult({ results: [] }).fetchAll()).to.deep.equal([]);
            expect(sqlResult({ results: [[]] }).fetchAll()).to.deep.equal([]);
        });

        it('returns an array containing the data counterpart of each item in the result set', () => {
            const row = { toArray };
            const rows = ['foo', 'bar'];

            td.when(toArray()).thenReturn(rows[1]);
            td.when(toArray(), { times: 1 }).thenReturn(rows[0]);

            expect(sqlResult({ results: [[row, row]] }).fetchAll()).to.deep.equal(rows);
        });
    });

    context('fetchOne()', () => {
        it('returns undefined when there are no items in the result set', () => {
            /* eslint-disable no-unused-expressions */
            expect(sqlResult().fetchOne()).to.not.exist;
            expect(sqlResult({ results: undefined }).fetchOne()).to.not.exist;
            expect(sqlResult({ results: [] }).fetchOne()).to.not.exist;
            /* eslint-enable no-unused-expressions */
            return expect(sqlResult({ results: [[]] }).fetchOne()).to.not.exist;
        });

        it('returns the next available item in the result set', () => {
            const row = { toArray };
            const rows = [['foo']];

            td.when(toArray()).thenReturn(rows[0]);

            expect(sqlResult({ results: [[row]] }).fetchOne()).to.equal(rows[0]);
        });
    });

    context('getAffectedItemsCount()', () => {
        it('returns the same result as getAffectedRowsCount()', () => {
            expect(sqlResult({ rowsAffected: 3 }).getAffectedItemsCount()).to.equal(3);
        });
    });

    context('getAutoIncrementValue()', () => {
        it('returns the first value generated by "AUTO INCREMENT" for a given operation', () => {
            expect(sqlResult({ generatedInsertId: 1 }).getAutoIncrementValue()).to.equal(1);
        });
    });

    context('getColumns()', () => {
        let getAlias;

        beforeEach('create fakes', () => {
            getAlias = td.function();
        });

        afterEach('reset fakes', () => {
            td.reset();
        });

        it('returns the metadata for each item in the result set wrapped as a Column instance', () => {
            const res = sqlResult({ metadata: [[{ getAlias }, { getAlias }]] });
            const columns = res.getColumns();

            td.when(getAlias()).thenReturn('bar');
            td.when(getAlias(), { times: 1 }).thenReturn('foo');

            expect(columns).to.have.lengthOf(2);
            expect(columns[0]).to.contain.keys('getColumnLabel');
            expect(columns[0].getColumnLabel()).to.equal('foo');
            expect(columns[1]).to.contain.keys('getColumnLabel');
            expect(columns[1].getColumnLabel()).to.equal('bar');
        });
    });

    context('getWarnings()', () => {
        it('returns the list of warnings generated by the server for a given operation', () => {
            const warnings = ['foo', 'bar'];

            expect(sqlResult({ warnings }).getWarnings()).to.deep.equal(warnings);
        });
    });

    context('getWarningsCount()', () => {
        it('returns the number of warnings generated by the server for a given operation', () => {
            const warnings = ['foo', 'bar', 'baz'];

            expect(sqlResult({ warnings }).getWarningsCount()).to.deep.equal(3);
        });
    });

    context('hasData()', () => {
        it('returns false if the result set does not contain any item', () => {
            // eslint-disable-next-line no-unused-expressions
            expect(sqlResult().hasData()).to.be.false;
            return expect(sqlResult({ results: [] }).hasData()).to.be.false;
        });

        it('returns true if the result set contains items', () => {
            return expect(sqlResult({ results: [[{ data: 'foo' }]] }).hasData()).to.be.true;
        });
    });

    context('nextResult()', () => {
        let fstCall, sndCall;

        beforeEach('create fakes', () => {
            fstCall = td.function();
            sndCall = td.function();
        });

        it('returns false if there are no other result sets available', () => {
            /* eslint-disable no-unused-expressions */
            expect(sqlResult().nextResult()).to.be.false;
            expect(sqlResult({ results: undefined }).nextResult()).to.be.false;
            /* eslint-enable no-unused-expressions */
            return expect(sqlResult({ results: [] }).nextResult()).to.be.false;
        });

        it('moves the cursor to the next available result set', () => {
            const res = sqlResult({ results: [[{ toArray: fstCall }], [{ toArray: sndCall }]] });

            td.when(fstCall()).thenReturn(['foo']);
            td.when(sndCall()).thenReturn(['bar']);

            // eslint-disable-next-line no-unused-expressions
            expect(res.nextResult()).to.be.true;
            expect(res.fetchOne()).to.deep.equal(['bar']);
        });
    });
});
