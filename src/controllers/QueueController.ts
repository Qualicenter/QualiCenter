import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import QueueData from "../modelsNoSQL/QueueData"; // Import your QueueData model

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
    }

    // Update the inQueue field of a QueueData item
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
}

export default QueueDataController;
