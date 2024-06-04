import { Request, Response} from "express";
import AbstractController from "./AbstractController";
import { Sequelize } from 'sequelize';
import db from '../models/Index';

class ClientsController extends AbstractController{ 
    private static _instance: ClientsController;

    public static get instance():AbstractController{
        if(!this._instance){
            this._instance = new ClientsController("cliente");
        }
        return this._instance;
    }

    protected initRoutes(): void {
        this.router.get('/vehicle/get-info/:telefono', this.getVehicleInfo.bind(this));
        this.router.get('/getClients', this.getClients.bind(this));
        this.router.post('/addSiniestro', this.addSiniestro.bind(this));
        this.router.get('/getSiniestros', this.getSiniestros.bind(this));
    }   

    private async getVehicleInfo(req: Request, res: Response){
        const { telefono } = req.params;
        const { QueryTypes } = require('sequelize');
        try {
            const VehicleInfo = await db.sequelize.query!(
                `SELECT * FROM Vehicle
                JOIN Poliza ON Vehicle.numPoliza = Poliza.numPoliza
                JOIN Cliente ON Cliente.Telefono = Poliza.Telefono
                WHERE Cliente.Telefono = :telefono`,
                {
                    replacements: { telefono },
                    type: QueryTypes.SELECT
                }
            );
            res.status(200).json(VehicleInfo);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    private async getClients(req: Request, res: Response){
        try {
            const clients = await db.Cliente.findAll();
            res.status(200).json(clients);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    private async addSiniestro(req: Request, res: Response){
        const { numPoliza, direccion, ambulancia, grua } = req.body;
        try {
            const newSiniestro = await db.Siniestro.create({
                numPoliza,
                direccion,
                ambulancia,
                grua
            });
            res.status(200).json(newSiniestro);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    private async getSiniestros(req: Request, res: Response){
        try {
            const siniestros = await db.Siniestro.findAll();
            res.status(200).json(siniestros);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default ClientsController;