const { Model } = require('./../boost');

class TestModel extends Model {
    static configure() {
        return {
            table: 'test',
            prefix: 'test_',
            fields: {
                id: { prime: true, field: 'id' },
                username: { type: String },
                password: { type: String }
            }
        }
    }
}

const model = new TestModel({ username: 'aa', password: 'bb', id: 'xxx' });
console.log(model.getFindSqlInfo());
console.log(model.getInsertSqlInfo());
console.log(model.getUpdateSqlInfo());
console.log(model.getRemoveSqlInfo());

