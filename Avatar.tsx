import { useSession } from "next-auth/react";
import React from "react";
import Image from "next/image";


type Props = {
    seed?: string
    large?: boolean
}

function Avatar({seed, large}:Props){
    const {data : session} = useSession();
    var format = session?.user?.name || "placeholder"
    return(
        <div className={`relative h-10 w-10 overflow-hidden bg-white rounded-full border-gray-300
        ${large && "h-20 w-20"}`}>
            <Image 
            layout="fill"
            src={'https://avatars.dicebear.com/api/open-peeps/' + format + ".svg"} />
        </div>
    )
}



export default Avatar