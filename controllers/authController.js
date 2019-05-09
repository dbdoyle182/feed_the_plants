const aws = require("../scripts/key").aws;
var AWS = require("aws-sdk");
const crypto = require("crypto");
// Set the region
AWS.config.update({
  region: `us-east-1`,
  accessKeyId: aws.awsAccessKeyId,
  secretAccessKey: aws.awsSecretAccessKey
});
global.navigator = () => null;
// console.log(AWS);

const clientId = aws.ecoSystemClient;

const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

module.exports = {
  signUp: (req, res) => {
    const { email, name, phone_number, password } = req.body;
    // let secretHash = crypto
    //   .createHmac("SHA256", clientSecret)
    //   .update(email + clientId)
    //   .digest("base64");
    let params = {
      ClientId: clientId,
      Password: password,
      Username: email,
      // SecretHash: secretHash,
      UserAttributes: [
        {
          Name: "email",
          Value: email
        },
        {
          Name: "phone_number",
          Value: phone_number
        },
        {
          Name: "name",
          Value: name
        }
      ],
      ValidationData: [
        {
          Name: "email",
          Value: email
        },
        {
          Name: "phone_number",
          Value: phone_number
        }
      ]
    };

    cognitoIdentityServiceProvider.signUp(params, (err, data) => {
      if (err) {
        console.log(err);
        res.status(400).json(err.message);
      } else {
        console.log(data);
        res.status(201).json(data);
      }
    });
  },
  logIn: (req, res) => {
    const { username, password } = req.body;
    const params = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    };
    cognitoIdentityServiceProvider.initiateAuth(params, (err, data) => {
      if (err) {
        console.log(err);
        res.status(400).json(err);
      } else {
        console.log(data);
        res.status(200).json(data);
      }
    });
  },
  confirmSignUp: (req, res) => {
    const { confirmCode, username } = req.body;
    const params = {
      ClientId: clientId,
      ConfirmationCode: confirmCode,
      Username: username
    };
    cognitoIdentityServiceProvider.confirmSignUp(params, (err, data) => {
      if (err) {
        console.log(err);
        res.status(400).json(err.message);
      } else {
        res.status(200).json({
          message: "Successfully confirmed"
        });
      }
    });
  },
  resendConfirmationCode: (req, res) => {
    const { username } = req.body;
    const params = {
      ClientId: clientId,
      Username: username
    };
    cognitoIdentityServiceProvider.resendConfirmationCode(
      params,
      (err, data) => {
        if (err) {
          console.log(err);
          res.status(400).json({ message: err.message });
        } else {
          console.log(data);
          res.status(200).json(data);
        }
      }
    );
  },
  // THIS HAS TO BE PERFORMED ALONGSIDE THE USER SETTINGS
  setUserMFAPreference: (req, res) => {
    const { access_token, mfa } = req.body;
    const params = {
      AccessToken: access_token,
      SMSMfaSettings: {
        Enabled: mfa == "true",
        PreferredMfa: mfa == "true"
      }
    };

    cognitoIdentityServiceProvider.setUserMFAPreference(params, (err, data) => {
      if (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
      } else {
        console.log(data);
        res
          .status(200)
          .json({ message: `Successfully set MFA to ${mfa == "true"}` });
      }
    });
  },
  // ACTUALLY DISABLES/ENABLES MFA (...what...)
  setUserSettings: (req, res) => {
    const { access_token, enable } = req.body;
    const params = {
      AccessToken: access_token,
      MFAOptions: [
        {
          AttributeName: "phone_number",
          DeliveryMedium: enable == "true" ? "SMS" : null
        }
      ]
    };

    cognitoIdentityServiceProvider.setUserSettings(params, (err, data) => {
      if (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
      } else {
        console.log(data);
        res.status(200).json(data);
      }
    });
  },

  respondToAuthChallenge: (req, res) => {
    const { code, username, session } = req.body;
    const params = {
      ChallengeName: "SMS_MFA",
      ChallengeResponses: {
        SMS_MFA_CODE: code,
        USERNAME: username
      },
      ClientId: clientId,
      Session: session
    };

    cognitoIdentityServiceProvider.respondToAuthChallenge(
      params,
      (err, data) => {
        if (err) {
          console.log(err);
          res.status(400).json({
            message: err.message
          });
        } else {
          console.log(data);
          res.status(200).json(data);
        }
      }
    );
  },

  getUser: (req, res) => {
    const access_token = req.query.token;
    const params = {
      AccessToken: access_token
    };

    cognitoIdentityServiceProvider.getUser(params, (err, data) => {
      if (err) {
        console.log(err);
        res.status(400).json({
          message: err.message
        });
      } else {
        res.status(200).json(data);
      }
    });
  },

  updateUserAttributes: (req, res) => {
    let array = [];

    for (let i in req.body) {
      let newObj = {};
      newObj["Name"] = i;
      newObj["Value"] = req.body[i];
      array.push(newObj);
    }
    const access_token = req.query.token;
    const params = {
      AccessToken: access_token,
      UserAttributes: array
    };

    cognitoIdentityServiceProvider.updateUserAttributes(params, (err, data) => {
      if (err) {
        console.log(err);
        res.status(400).json({
          message: err.message
        });
      } else {
        console.log(data);
        res.status(200).json({
          message: `Successfully updated user attributes`
        });
      }
    });
  },

  changePassword: (req, res) => {
    const { old_password, new_password, access_token } = req.body;
    const params = {
      AccessToken: access_token,
      PreviousPassword: old_password,
      ProposedPassword: new_password
    };

    cognitoIdentityServiceProvider.changePassword(params, (err, data) => {
      if (err) {
        res.status(400).json({
          message: err.message
        });
      } else {
        console.log(data);
        res.status(200).json({
          message: "Password was successfully changed."
        });
      }
    });
  },

  forgotPassword: (req, res) => {
    const username = req.query.username;
    const params = {
      ClientId: clientId,
      Username: username
    };

    cognitoIdentityServiceProvider.forgotPassword(params, (err, data) => {
      if (err) {
        console.log(err);
        res.status(400).json({
          message: err.message
        });
      } else {
        console.log(data);
        res.status(200).json(data);
      }
    });
  },

  confirmForgotPassword: (req, res) => {
    const { username, password, code } = req.body;
    const params = {
      ClientId: clientId,
      ConfirmationCode: code,
      Password: password,
      Username: username
    };

    cognitoIdentityServiceProvider.confirmForgotPassword(
      params,
      (err, data) => {
        if (err) {
          console.log(err);
          res.status(400).json({
            message: err.message
          });
        } else {
          console.log(data);
          res.status(200).json({
            message: "Password was successfully changed"
          });
        }
      }
    );
  },

  globalSignOut: (req, res) => {
    const params = {
      AccessToken: req.query.token
    };
    cognitoIdentityServiceProvider.globalSignOut(params, (err, data) => {
      if (err) {
        console.log(err);
        res.status(400).json({
          message: err.message
        });
      } else {
        console.log(data);
        res.status(200).json({
          message: "User was signed out of any active devices"
        });
      }
    });
  },


  // Will circle back to this at a later date
  refreshSession: (req, res) => {
    const { refresh_token } = req.body;
    const params = {
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: clientId,
      AuthParameters: {
        REFRESH_TOKEN: refresh_token
      }
    };
    cognitoIdentityServiceProvider.initiateAuth(params, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
      }
    });
  }
};
