const request = require('supertest');
// express app
const app = require('./index');

// db setup
const { sequelize, Dog } = require('./db');
const seed = require('./db/seedFn');
const {dogs} = require('./db/seedData');

describe('Endpoints', () => {
    // to be used in POST test
    const testDogData = {
        breed: 'Poodle',
        name: 'Sasha',
        color: 'black',
        description: 'Sasha is a beautiful black pooodle mix.  She is a great companion for her family.'
    };

    beforeAll(async () => {
        // rebuild db before the test suite runs
        await seed();
    });

    describe('GET /dogs', () => {
        it('should return list of dogs with correct data', async () => {
            // make a request
            const response = await request(app).get('/dogs');
            // assert a response code
            expect(response.status).toBe(200);
            // expect a response
            expect(response.body).toBeDefined();
            // toEqual checks deep equality in objects
            expect(response.body[0]).toEqual(expect.objectContaining(dogs[0]));
        });
    });

    describe('POST /dogs', () => {
        it('should create a new dog instance in the db', async () => {
            // send a post request via supertest
            const response = await request(app).post('/dogs')
                .send(testDogData)
                .set('Accept', 'application/json');

            // assert a response code 
            expect(response.status).toBe(200);

            // assert ...
            const { breed, name, description, color } = response.body;
            expect({ breed, name, color, description }).toEqual(testDogData)


        });

        it("should create a dog instance and match the id", async () => {
            const response = await request(app).post('/dogs')
                .send(testDogData)
                .set('Accept', 'application/json');

            // find the last created id 
            const lastCreatedId = await Dog.findOne({
                attributes: ['id'],
                order: [['createdAt', 'DESC']], 
            })

            const sequelizeId = lastCreatedId.id;

            const { id } = response.body;

            expect( id ).toEqual( sequelizeId );
        })
    })

    describe('DELETE /dogs/:id', () => { 

        it("should delete a dog instance with id 1", async () => {

            const itemIdToDelete = 1;

            const response = await request(app).delete(`/dogs/${itemIdToDelete}`);
            
            // Assert the response status and content
            expect(response.status).toBe(200);
        })
    })
});
