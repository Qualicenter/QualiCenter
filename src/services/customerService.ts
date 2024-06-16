/**
 * @author Angel Armando Marquez Curiel
 * @author 
 * @author
 * 
 * Controller in charge of managing the requests related to the agent
 */ 

import AWS from 'aws-sdk';
import { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY} from '../config';

/*Configure AWS*/
AWS.config.update({
    accessKeyId:AWS_ACCESS_KEY_ID,
    secretAccessKey:AWS_SECRET_ACCESS_KEY,
    region:AWS_REGION
});

// Client for Customer Profiles
const customer = new AWS.CustomerProfiles();

export default customer;
