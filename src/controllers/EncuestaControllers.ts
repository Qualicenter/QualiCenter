import { Response, Request } from "express";
import AbstractController from "./AbstractController";
import EncuestaModel from "../modelsNoSQL/Encuesta";

//Hereda de AbstractController por eso usamos extends
class EncuestaController extends AbstractController {
  //Singleton tecnica de programación, fuerza que la clase solo tenga una instancia y que sea reutilizable
  //Atributo de clase privado y estático
  private static _instance: EncuestaController;

  //Si no existe la instancia la genera
  //Si existe la regresa
  public static get instance(): AbstractController {
    if (!this._instance) {
      this._instance = new this("EncuestaModel");
    }
    return this._instance;
  }

  //Declarar todas las rutas del controlador
  //Metodo de clase estático que devuelve la instancia
  protected initRoutes(): void {
    //Como especificamos el get, podemos usarlo como atributo en lugar de metodo
    //Similar a la promesa de javaScript
    this.router.post("/postEncuesta", this.postEncuesta.bind(this));
    this.router.get("/getEncuesta", this.getEncuesta.bind(this));

  }

  //Podemos crecer los metodos de instancia y solo asociar con otro this.router.get o post no importa
  //Metodos de instancia
  //Se declara privada porque solo init routes la va a usar

  private async getEncuesta(req: Request, res: Response) {
    try {
      const encuesta = await EncuestaModel.scan().exec().promise();
      console.log(encuesta);
      res.status(200).send(encuesta[0].Items);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error " + error);
    }
  }

  private async postEncuesta(req: Request, res: Response) {
    try {
      console.log(req.body);
      await EncuestaModel.create(req.body); //INSERT
      console.log("Encuesta Creada");
      res.status(200).send("<h1>Encuesta Creada</h1>");
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error " + error);
    }
  }
}
  export default EncuestaController;