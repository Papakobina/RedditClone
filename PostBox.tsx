import { useSession } from "next-auth/react";
import React from "react";
import Avatar from "../components/Avatar";
import { LinkIcon, PhoneOutgoingIcon } from "@heroicons/react/outline";
import { PhotographIcon } from "@heroicons/react/solid";
import {useForm} from "react-hook-form";
import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_POST, ADD_SUBREDDIT } from "../graphql/mutations";
import client from "../apollo-client";
import { GET_SUBREDDIT_BY_TOPIC } from "../graphql/queries";
import { handleClientScriptLoad } from "next/script";



type FormData = {
    postTitle: string
    postBody: string
    postImage:  string
    subreddit: string
}



function PostBox(){
    const {data : session} = useSession()
    const [addPost] = useMutation(ADD_POST)
    const [addSubreddit] = useMutation(ADD_SUBREDDIT)

    const [imageBoxOpen, setImageBoxOpen] = useState<boolean>(false)
    const{
        register,
        setValue,
        handleSubmit,
        watch,
        formState: {errors},
    } = useForm<FormData>()

    const onSubmit = handleSubmit(async (formdata) => {
        try {
            // Query for the subreddit topic 
            const {
                data: {getSubredditListByTopic},

            } = await client.query({
                query: GET_SUBREDDIT_BY_TOPIC,
                variables:{
                    topic: formdata.subreddit
                }
            })

            const subredditExist = getSubredditListByTopic.length > 0;

            if (!subredditExist){
                const {data: {insertSubreddit : newSubreddit}}= await addSubreddit({
                    variables:{
                        topic: formdata.subreddit
                    }
                })

                const image = formdata.postImage || ""

                const{data: {insertPost: newPost},} = await addPost({
                    variables:{
                        body: formdata.postBody,
                        image: image,
                        subreddit_id: newSubreddit.id,
                        title: formdata.postTitle,
                        username: session?.user?.name,
                    },
                })
            }else{
                const image = formdata.postImage || ""

                const {data: { insertPost: newPost}} = await addPost({
                    variables:{
                        body: formdata.postBody,
                        image: image,
                        subreddit_id: getSubredditListByTopic[0].id,
                        title: formdata.postTitle,
                        username: session?.user?.name,
                    }
                })

            }
            setValue("postBody", "")
            setValue("postImage", "")
            setValue("postTitle", "")
            setValue("subreddit", "")
        } catch (error) {
            
        }

    })
   
    return(
        <form onSubmit={onSubmit} className=" sticky top-16 z-50 bg-white border border-gray-300 p-2 rounded-md">
            <div className="flex space-x-3 items-center">
                <Avatar />
                <input 
                {... register("postTitle", {required: true})}
                type="text"
                disabled={!session}
                className= "bg-gray-50 p-2 pl-5 outline-none flex-1 rounded-md" 
                placeholder={ session ? "Create a post by entering a title" : "sign in to post "}/>

               <PhotographIcon 
               onClick={() => setImageBoxOpen(!imageBoxOpen)} 
               className= {`h-6 text-gray-300 cursor-pointer ${imageBoxOpen && `text-blue-300`}`} />
               <LinkIcon className="h-6 text-gray-300"/>
            </div>
            {!!watch("postTitle") &&(
                <div className="flex flex-col py-2">
                    <div className="flex items-center px-2">
                        <p className="min-w-[90px]">Body </p>
                        <input className="m-2 flex-1 bg-blue-50"
                        {... register("postBody")}
                        type="text" placeholder="Text (optional)"/>
                    </div>
                    <div className="flex items-center px-2">
                        <p className="min-w-[90px]">subreddit </p>
                        <input className="m-2 flex-1 bg-blue-50 outline-none"
                        {... register("subreddit", {required: true})}
                        type="text" placeholder="i.e reactjs"/>
                    </div>

                    {imageBoxOpen && (
                        <div className="flex items-center px-2">
                        <p className="min-w-[90px]">Image URL </p>
                        <input className="m-2 flex-1 bg-blue-50 outline-none"
                        {... register("postImage")}
                        type="text" placeholder="Optional..."/>
                    </div>


                    )}

                    {Object.keys(errors).length > 0 && (
                        <div className="space-y-2 p-2 text-red-500">
                            {errors.postTitle?.type ==="required" &&(
                                <p> A post Title is required!!</p>
                            )}

                            {errors.subreddit?.type ==="required" &&(
                                <p> A Subreddit is required!!</p>
                            )}

                        </div>
                    )}  
                     {!! watch("postTitle") && (
                        <button type="submit" className="w-full rounded-full bg-blue-400 p-2 text-white"> Create Post</button>
                    )}   

                </div>

            )}
        </form>
    )
}



export default PostBox