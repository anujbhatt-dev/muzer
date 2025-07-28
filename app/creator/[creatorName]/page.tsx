import CreatorView from "@/app/components/CreatorView"

export default async function CreatorPage({params}:{params:Promise<{creatorName:string}>}) {
  const {creatorName} = await params
  return (
    <CreatorView creatorName={creatorName}/>
    
  )
}
