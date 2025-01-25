import { Picture } from "./picture.model";

export class Item{
    id!: number;
    name!: string;
    description!: string;
    price!: number;
    discount!: number;
    quantity!: number;
    discounted!: number;
    pictures!: Picture[];
    newlyAdded!: boolean;
    category!: string;
    brand!: string;
    location!: string;
    code!: string;
    sex!:string;
    sizes!: any[];
    requestedSize!: string;
    available!: boolean

}