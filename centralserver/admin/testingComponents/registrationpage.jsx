import React, { useEffect, useState } from 'react'
import {Label, Icon, Box, ApiClient, Placeholder, withNotice, Button, useTranslation, Illustration, Text, H1, H2, H3, H4, FormGroup, FormGroupProps, InputGroup, FormMessage, Input} from 'admin-bro'
import {Image} from "react-bootstrap";
import {useInput} from "./useInput";
import axios from 'axios';

const api = new ApiClient()
const pageHeaderHeight = 284
const pageHeaderPaddingY = 74
const pageHeaderPaddingX = 250

const NOTICE_MESSAGE = {
    message: 'I was clicked',
    type: 'success',
}



const SomeStats = ({ addNotice }) => {
    const [text, setText] = useState('');
    const { value:userID, bind:binduserID, reset:resetUserID } = useInput('');
    const { value:userPass, bind:binduserPass, reset:resetuserPass } = useInput('');
    const { value:firstName, bind:bindfirstName, reset:resetfirstName} = useInput('');
    const { value:lastName, bind:bindlastName, reset:resetlastName } = useInput('');

    useEffect(() => {
        api.getPage({pageName: 'customPage'}).then(res => {
            setText(res.data.text)
        })
    })



    const DashboardHeader = () => {
        const {translateMessage} = useTranslation();
        return (
            <Box position="relative" overflow="hidden">
                <Box
                    position="absolute"
                    top={50}
                    left={-10}
                    opacity={[0.2, 0.4, 1]}
                    animate
                >
                    <Illustration variant="Rocket"/>
                </Box>
                <Box
                    position="absolute"
                    top={-70}
                    right={-15}
                    opacity={[0.2, 0.4, 1]}
                    animate
                >
                    <Illustration variant="Moon"/>
                </Box>
                <Box
                    bg="grey100"
                    height={pageHeaderHeight}
                    py={pageHeaderPaddingY}
                    px={['default', 'lg', pageHeaderPaddingX]}
                >
                    <Text textAlign="center" color="white">
                        <Image src="https://i.imgur.com/koafETH.png?1"/>
                    </Text>
                </Box>
            </Box>
        )
    }

    const handleSubmitRegister = (evt) => {
        evt.preventDefault();

        console.log(firstName);
        axios.post('/superadmin/registerUserOnRainbow', {
                email: userID,
                password: userPass,
                firstName: firstName,
                lastName: lastName

            }
        ).then(response =>{
            console.log(response);
        })
            .catch(error => {
                console.log(error);
            })
        alert(`Submitting Name ${firstName} ${lastName}`);
        resetfirstName();
        resetuserPass();
        resetUserID();
        resetlastName();
    }

    return (
            <Box>
                <Box border>
                    <DashboardHeader/>
                    <Box variant = "grey">
                    <H1>Register/Terminate Agents from Platform Here!</H1>
                    <div>
                        <br/>
                        <H3>Changes will be reflected on Rainbow Platform</H3>

                        <Box variant = 'white' width={[1, 1, 1/2 ]} p="lg"><br/>
                        <H4>Register New Agent</H4>
                        <form onSubmit={handleSubmitRegister}>
                            <Label required>First Name (of Agent)</Label>
                            <InputGroup>
                                <Button variant="primary" size="icon">
                                    <Icon icon="ChevronRight"/>
                                </Button>
                                <Input required {...bindfirstName}/>
                                <Label> </Label>
                                <Button variant="primary" size="icon">
                                    <Icon icon="ChevronRight"/>
                                </Button>
                            </InputGroup>
                            <br></br>
                            <Label >Last Name (of Agent)</Label>
                            <InputGroup>
                                <Button variant="primary" size="icon">
                                    <Icon icon="ChevronRight"/>
                                </Button>
                                <Input  {...bindlastName}/>
                                <Label>optional field </Label>
                                <Button variant="primary" size="icon">
                                    <Icon icon="ChevronRight"/>
                                </Button>
                            </InputGroup>
                            <br></br>
                            <Label required>Email Intended</Label>
                            <InputGroup>
                                <Button variant="primary" size="icon">
                                    <Icon icon="ChevronRight"/>
                                </Button>
                                <Input required {...binduserID}/>
                                <Label>use domain @swaggy.com </Label>
                                <Button variant="primary" size="icon">
                                    <Icon icon="ChevronRight"/>
                                </Button>
                            </InputGroup>
                            <br></br>
                            <Label required>Password Intended</Label>
                            <InputGroup>
                                <Button variant="primary" size="icon">
                                    <Icon icon="ChevronRight"/>
                                </Button>
                                <Input required  {...binduserPass}/>
                                <Button variant="primary" size="icon">
                                    <Icon icon="ChevronRight"/>
                                </Button>
                            </InputGroup>
                            <br/>
                            <Button type={"submit"}>Generate Agent</Button>
                        </form>
                        </Box>


                    </div>
                    </Box>
                </Box>
            </Box>
        )

}

export default withNotice(SomeStats)
