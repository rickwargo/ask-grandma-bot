/*jslint node: true */
/*jslint todo: true */
'use strict';

module.exports = {
    profile: 'CLI', // optional for loading AWS credentials from custom profile
    applicationId: 'amzn1.echo-sdk-ams.app.64f5259f-6242-4e03-8104-5c4a1ad3f26a',
    applicationName: 'askGrandmom',
    namespace: 'Ask.',
    region: 'us-east-1',
    handler: 'index.handler',
    functionName: 'Ask-Grandmom-Skill',
    timeout: 3,
    memorySize: 128,
    runtime: 'nodejs' // default: 'nodejs'
};