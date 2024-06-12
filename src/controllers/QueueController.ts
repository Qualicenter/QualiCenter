import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import QueueData from "../modelsNoSQL/QueueData"; // Import your QueueData model
import connect from "../services/connectService"; // Import Amazon Connect SDK
import { AWS_INSTANCE_ID } from "../config";

// Controller for the QueueData model, which represents the data of all calls in Queue
class QueueDataController extends AbstractController {
    private static _instance: QueueDataController;

    public static get instance(){
        if(!this._instance){
            this._instance = new QueueDataController("queuedata");
        }
        return this._instance;
    }

    protected initRoutes(): void {
        this.router.put("/updateQueueData", this.updateQueueData.bind(this));
        this.router.get("/getActiveCallsInQueue", this.getActiveCallsInQueue.bind(this)); // Get all active calls in the queue
        this.router.put("/updateDisconnectedCalls", this.updateDisconnectedCalls.bind(this)); //
    }

    // Update the inQueue field of a call in the QueueData table (Used when a call is answered by an agent)
    private async updateQueueData(req: Request, res: Response) {
        const { ContactID } = req.body;

        try {
            await QueueData.update( { ContactID: ContactID, InQueue: false} );
            res.status(200).send("Queue data updated successfully");
        } catch (err) {
            console.error("Error updating queue data:", err);
            res.status(500).send("Internal server error");
        }
    }

    // Get all active calls in the queue
    private async getActiveCallsInQueue(req: Request, res: Response) {
        try {
            const data = await QueueData.scan().where('InQueue').eq(true).exec().promise();
            res.status(200).json(data);
        } catch (err) {
            console.error("Error fetching active queue data:", JSON.stringify(err));
            res.status(500).send("Internal server error");

        }
    }

    // Update the inQueue field of a call that has been disconnected before being answered by an agent
    private async updateDisconnectedCalls(req: Request, res: Response) {
        try {
            // Perform scan operation to get active calls in queue
            const pages = await QueueData.scan().where('InQueue').eq(true).exec().promise();
            
            // Iterate over each page to extract ContactIDs
            const contactIDs: string[] = [];
            for (const page of pages) {
                if (page.Items) {
                    for (const item of page.Items) {
                        const contactID = item.attrs.ContactID; // Access ContactID from attrs property
                        contactIDs.push(contactID);
                    }
                }
            }

            // Iterate over each ContactID to check if it has been disconnected
            for (const contactID of contactIDs) {
                const params = {
                    InstanceId: AWS_INSTANCE_ID, // Replace with your Amazon Connect instance ID
                    ContactId: contactID
                };
                
                try {
                    const result = await connect.describeContact(params).promise();
                    if (result.Contact && result.Contact.DisconnectTimestamp) {
                        // Update InQueue attribute to false if contact has been disconnected
                        await QueueData.update({ ContactID: contactID, InQueue: false });
                    }
                } catch (err) {
                    console.error(`Error describing contact ${contactID}:`, err);
                }
            }
            res.status(200).send("Disconnected calls updated successfully");
        } catch (err) {
            console.error("Error updating disconnected calls:", err);
            res.status(500).send("Internal server error");
        }
    }

}

export default QueueDataController;
