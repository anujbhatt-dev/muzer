import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import z, { string } from "zod";

const MyStreamSchema = z.object({
    username:z.string(),
    asker:z.string()
})

export async function POST(request:NextRequest){
    const data = MyStreamSchema.parse(await request.json());    
    try {
        
        const user = await prismaClient.user.findUnique({
            where: { username: data.username },
            select: { id: true },
          });
      
          if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
          }



        const [streams,activeStream] = await Promise.all([
            prismaClient.stream.findMany({
                where:{
                    creatorId:user.id,
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
                orderBy: [
                    {
                      upvotes: {
                        _count: 'desc',
                      },
                    },
                    {
                      createdAt: 'asc', // older streams come first if upvotes are equal
                    },
                  ],
            }),
            prismaClient.currentStream.findFirst({
                where:{
                    userId:user.id
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