import CreatorView from "@/app/components/CreatorView"

export default async function CreatorPage({params}:{params:Promise<{creatorId:string}>}) {
  const {creatorId} = await params
  return (
    <CreatorView creatorId={creatorId}/>
    
  )
}
