import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const CreateStreameSchema = z.object({
    creatorId:z.string(),
    url:z.string(),

})

export async function POST(request:NextRequest){
    
    try {
        const data = CreateStreameSchema.parse(await request.json());
        
        
    } catch (error) {
        return NextResponse.json({
            message:"Error while adding a stream"
        }, {status:411})
    }

}