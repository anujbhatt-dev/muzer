import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import * as youtubesearchapi from "youtube-search-api";
import { YT_REGEX } from "@/app/lib/utils";

const CreateStreameSchema = z.object({
    creatorId:z.string(),
    url:z.string(),
})

export async function POST(request:NextRequest){    
    console.log("here");
    
    try {
        const data = CreateStreameSchema.parse(await request.json());
        const isYt = data.url.match(YT_REGEX);
        if(!isYt){
            return NextResponse.json({
                message:"Wrong URL format"
            },{
                status:411
            })
        }
        
        
        const extractedId = data.url.split("?v=")[1].split("&")[0];


        const videoDetails = await youtubesearchapi.GetVideoDetails(extractedId)

        if (
            !videoDetails ||
            typeof videoDetails !== "object" ||
            !videoDetails.title ||
            !videoDetails.thumbnail ||
            !Array.isArray(videoDetails.thumbnail.thumbnails)
          ) {
            return NextResponse.json(
              { message: "Invalid or unavailable video. Thumbnail data missing." },
              { status: 400 }
            );
          }


        const {title,thumbnail} = videoDetails
        const thumbnails = thumbnail.thumbnails
        thumbnails.sort((a:{width:number},b:{width:number})=> a.width > b.width ? -1 : 1)
        console.log(thumbnails);
        
        
        const stream = await prismaClient.stream.create(
            {
                data:{
                    creatorId:data.creatorId,
                    url:data.url,
                    extractedId,
                    type:"Youtube",
                    title,
                    smallImg:thumbnails[1].url,
                    bigImage:thumbnails[0].url
                }
            }
        )


        return NextResponse.json({
            message:"Added stream",
            ...stream

        },{
            status:201
        })


    } catch (error) {
        console.log(error);        
        return NextResponse.json({
            message:"Error while adding a stream"
        }, {status:411})
    }

}

// export async function GET(request:NextRequest){
//     const creatorId = request.nextUrl.searchParams.get("creatorId")
//     const stream = await prismaClient.stream.findMany({
//         where:{
//             creatorId:creatorId ?? ""
//         }
//     })

//     return NextResponse.json({
//         message:"success"
//     },{
//         status:200
//     })
// }