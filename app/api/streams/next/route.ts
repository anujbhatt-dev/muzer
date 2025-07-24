import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server"
import z from "zod";

const NextVideoSchema = z.object({
    creatorId:z.string()
})

export async function POST(request:NextRequest){
    const data = NextVideoSchema.parse(await request.json());
    const user = await prismaClient.user.findFirst({
        where:{
            id:data.creatorId
        }
    })

    if(!user){
        return NextResponse.json({
            message:"unauthorised"
        },{
            status:403
        })
    }

    const mostUpvotedStream = await prismaClient.stream.findFirst({
        where:{
            creatorId:data.creatorId,
            played:false
        },
        orderBy:{
            upvotes:{
                _count:"desc"
            }
        }
    });
    if(!mostUpvotedStream){
        return NextResponse.json({
            message:"No stream available"
        },{
            status:400
        })
    }

    await Promise.all([
        prismaClient.currentStream.upsert({
            where:{
                userId:data.creatorId
            },
            update:{
                streamId:mostUpvotedStream.id
            },
            create:{
                userId:data.creatorId,
                streamId: mostUpvotedStream.id
            }
        }),
        prismaClient.stream.update({
            where:{
                id:mostUpvotedStream.id
            },
            data:{
                played:true,
                playedTs:new Date()
            }
        })
    ])

    return NextResponse.json({
        stream:mostUpvotedStream
    },{
        status:200
    })
}