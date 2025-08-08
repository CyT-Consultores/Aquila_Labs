// models/ResponseModel.js
class ResponseModel {
    static set(statusCode, message, data = null) {
        return {
            statusCode: statusCode,
            message: message,
            data: data
        };
    }
}

module.exports = ResponseModel;