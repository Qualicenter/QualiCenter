import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import CallsData from "../modelsNoSQL/CallsData"; // Import your CallsData model

class CallsDataController extends AbstractController {
    private static _instance: CallsDataController;

    public static get instance(){
        if(!this._instance){
            this._instance = new CallsDataController("callsdata");
        }
        return this._instance;
    }

    protected initRoutes(): void {
        this.router.get("/getCallsData", this.getCallsData.bind(this));
        this.router.get("/getActiveCallsData", this.getActiveCallsData.bind(this));
        this.router.post("/createCallData", this.createCallData.bind(this));
        this.router.put("/updateCallData", this.updateCallData.bind(this));
    }

    private async getCallsData(req: Request, res: Response) {
        try {
            const callsData = await CallsData.scan().exec().promise();
            res.status(200).send(callsData);
        } catch (err) {
            console.error("Error retrieving calls data:", err);
            res.status(500).send("Internal server error");
        }
    }

    private async getActiveCallsData(req: Request, res: Response) {
        try {
            const activeCallsData = await CallsData.scan().where('ended').equals(false).exec().promise();
            res.status(200).send(activeCallsData);
        } catch (err) {
            console.error("Error retrieving active calls data:", err);
            res.status(500).send("Internal server error");
        }
    }
    
    private async createCallData(req: Request, res: Response) {
        const { 
            clientContactId,
            clientPhoneNumber,
            clientContactInformation,
            agentContactInformation,
            clientQueueDateTime,
            finalDuration,
            ended
        } = req.body;
    
        try {
            const callData = await CallsData.create({
                clientContactId,
                clientPhoneNumber,
                clientContactInformation,
                agentContactInformation,
                clientQueueDateTime,
                finalDuration,
                ended
            });
            
            res.status(200).send("Call data created successfully");
        } catch (err) {
            console.error("Error creating call data:", err);
            res.status(500).send("Internal server error");
        }
    }    

    
    private async updateCallData(req: Request, res: Response) {
        const { clientContactId, finalDuration } = req.body;
        // Update the call data with the provided clientContactId:
        //      Update the field finalDuration to the body final duration
        //      Update the field ended to true

        // Use db.update where Id:id
        try {
            await CallsData.update({ clientContactId: clientContactId, finalDuration: Number(finalDuration), ended: true });
            res.status(200).send("Call data updated successfully");
        } catch (err) {
            console.error("Error updating call data:", err);
            res.status(500).send("Internal server error");
        }
    }
}


export default CallsDataController;
