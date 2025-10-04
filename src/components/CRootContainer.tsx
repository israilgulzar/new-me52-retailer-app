import { ImageBackground, } from 'react-native'
import React, { ReactNode } from 'react'
import images from '../assets/images'

type CRootContainerProps = {
    children?: ReactNode;
    [key: string]: any;
};

export default function CRootContainer({ children, ...props }: CRootContainerProps) {
    return (
        <ImageBackground source={images.appBg}
            resizeMode='cover'
            style={{
                flex: 1,
                height: '100%',
                width: '100%',
                ...props.style
            }}
            {...props}
        >
            {children}
        </ImageBackground>
    )
}
