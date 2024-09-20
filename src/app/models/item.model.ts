import { Picture } from "./picture.model.ts";

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

}