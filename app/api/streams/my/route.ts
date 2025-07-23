import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import z, { string } from "zod";

const MyStreamSchema = z.object({
    id:z.string()
})

export async function POST(request:NextRequest){
    const data = MyStreamSchema.parse(await request.json());
    
    try {
        const streams = await prismaClient.stream.findMany({
            where:{
                creatorId:data.id             
            },
            include:{
                _count:{
                    select:{
                        upvotes:true 
                    }
                },     
                upvotes:{
                    where:{
                        userId:data.id
                    }
                }           
            }
        })     
              
                
        return NextResponse.json({
            streams:streams.map(({_count,...rest}) =>({
                ...rest,
                upvotes:_count.upvotes,
                hasUpvoted: rest.upvotes.length ? true : false
            }))
        },{
            status:200
        })
    } catch (error) {
        console.log("error while getting my stream ", error);
        return NextResponse.json({error:"error while getting my stream"},{status:500})
        
    }
} 