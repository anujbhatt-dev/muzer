import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import z, { string } from "zod";

const MyStreamSchema = z.object({
    id:z.string(),
    asker:z.string()
})

export async function POST(request:NextRequest){
    const data = MyStreamSchema.parse(await request.json());    
    try {
        const [streams,activeStream] = await Promise.all([
            prismaClient.stream.findMany({
                where:{
                    creatorId:data.id,
                    played:false             
                },
                include:{
                    _count:{
                        select:{
                            upvotes:true 
                        }
                    },     
                    upvotes:{
                        where:{
                            userId:data.asker
                        }
                    }           
                },
                orderBy: {
                    upvotes: {
                    _count: 'desc', // or 'asc'
                    },
                },
            }),
            prismaClient.currentStream.findFirst({
                where:{
                    userId:data.id
                },
                include:{
                    stream:true
                }                
            })
    
        ])     
              
                
        return NextResponse.json({
            streams:streams.map(({_count,...rest}) =>({
                ...rest,
                upvotes:_count.upvotes,
                hasUpvoted: rest.upvotes.length ? true : false
            })),
            activeStream
        },{
            status:200
        })
    } catch (error) {
        console.log("error while getting my stream ", error);
        return NextResponse.json({error:"error while getting my stream"},{status:500})
        
    }
} 