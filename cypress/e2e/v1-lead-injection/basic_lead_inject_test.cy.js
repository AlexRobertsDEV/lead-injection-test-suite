const basePath = "/lead-inject-test"

const DEVELOPMENT_URLS = [
    'https://0527vcitaerrorcheck.staging7.townsquareinteractive.com',
    // 'https://0527growthpackagetest.staging7.townsquareinteractive.com',
    // 'https://cmsuberalltest12.staging7.townsquareinteractive.com',
    'https://vcitatest20230906.staging7.townsquareinteractive.com',
    'https://marstestclient.staging7.townsquareinteractive.com'
];

const RELEASE_URLS = [
    'https://0531vcitastarter.staging005.townsquareinteractive.com',
    'https://0601growthvcita.staging005.townsquareinteractive.com',
    // 'https://vcitaaug24.staging005.townsquareinteractive.com',
    'https://0601startervcita.staging005.townsquareinteractive.com',
    'https://busilife23.staging005.townsquareinteractive.com'
];

const PRODUCTION_URLS = [
    // 'https://0601vcitawidgetcheck.production.townsquareinteractive.com',
    'https://june5vcitastarter.production.townsquareinteractive.com',
    'https://0829vcitatest.production.townsquareinteractive.com',
    'https://0720vcitatest.production.townsquareinteractive.com'
];

//Function to determine the API endpoint based on the test URL domain

function getApiEndpoint(url) {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    if (domain.endsWith('staging7.townsquareinteractive.com')) {
        return 'https://staging7.townsquareinteractive.com/laravel/api/v1/formdata/postform';
    } else if (domain.endsWith('staging005.townsquareinteractive.com')) {
        return 'https://staging005.townsquareinteractive.com/laravel/api/v1/formdata/postform';
    } else if (domain.endsWith('production.townsquareinteractive.com')) {
        return 'https://formtraffic.townsquareinteractive.com/laravel/api/v1/formdata/postform';
    } else {
        throw new Error('Unknown environment');
    }
}

//Basic Lead injection Test
describe('Basic Lead Inject Test', () => {

    //Function to fill out the form
    function testLeadInjection(url) {
        it(`should successfully submit a form entry ${url}`, () => {
            const apiEndpoint = getApiEndpoint(url);

            //Visit URL
            cy.visit(url + basePath);

            //First Name
            cy.get('input[data-fieldlabel="First"]').type('Alex');

            //Last Name
            cy.get('input[data-fieldlabel="Last"]').type('Roberts');

            //Phone
            cy.get('input[data-fieldlabel="Phone"]').type('7045555555');

            //Email
            cy.get('input[data-fieldlabel="Email"]').type('alex.roberts@townsquareinteractive.com');

            //Message/Suggestions
            cy.get('textarea[data-fieldlabel="Message/Suggestions"]').type('test');

            // Security Check
            cy.get('.num1').invoke('text').then((num1) => {
                cy.get('.num2').invoke('text').then((num2) => {
                    const sum = parseInt(num1) + parseInt(num2);
                    cy.get('input[data-fieldlabel="Security Check"]').type(`${sum}`);
                });
            });

            //Intercept postform API call
            cy.intercept('POST', apiEndpoint).as('postform');

            // Submit The Form
            cy.get('input[value="Submit"]').click();

            // Confirm postform API call went through
            cy.wait('@postform').its('response.statusCode').should('eq', 200);

            // Assert the confirmation message
            cy.get('#gform_confirmation_message_1').should('be.visible').and('contain.text', 'Thanks for contacting us! We will get in touch with you shortly.');

        });
    }


    context('Staging: Develop', () => {
        DEVELOPMENT_URLS.forEach(url => {
            testLeadInjection(url);
        });
    })

    context('Staging: Release', () => {
        RELEASE_URLS.forEach(url => {
            testLeadInjection(url);
        });
    })

    context('Staging: Production', () => {
        PRODUCTION_URLS.forEach(url => {
            testLeadInjection(url);
        });
    })

})