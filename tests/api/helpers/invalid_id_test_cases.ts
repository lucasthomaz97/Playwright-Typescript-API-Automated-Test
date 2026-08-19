import { NON_EXISTENT_ID } from './constants';

export function generateInvalidIdCases(entityName: string, notFoundError: string, invalidIdError: string, notFoundCode: number = 404, invalidIdCode: number = 400) {
    return [
        { scenario: `should return ${notFoundCode} for a non-existent ${entityName} id`, inputId: NON_EXISTENT_ID, errorCode: notFoundCode, expectedError: { error: notFoundError } },
        { scenario: `should return ${invalidIdCode} for an invalid ${entityName} id`, inputId: 'invalid-id', errorCode: invalidIdCode, expectedError: { error: invalidIdError } },
        { scenario: `should return ${invalidIdCode} for a negative ${entityName} id`, inputId: -1, errorCode: invalidIdCode, expectedError: { error: invalidIdError } },
        { scenario: `should return ${invalidIdCode} for a decimal ${entityName} id`, inputId: 1.5, errorCode: invalidIdCode, expectedError: { error: invalidIdError } },
        { scenario: `should return ${notFoundCode} for a zero ${entityName} id`, inputId: 0, errorCode: notFoundCode, expectedError: { error: notFoundError } },
    ];
}
