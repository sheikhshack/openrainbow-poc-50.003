import React, {Component} from "react";
import {Label, Icon, Box, ApiClient, Placeholder, withNotice, Button, useTranslation, Illustration, Text, H1, H2, FormGroup, FormGroupProps, InputGroup, FormMessage, Input} from 'admin-bro'
import {Image} from "react-bootstrap";


class Postform extends Component{
    constructor(props, ) {
        super(props);
        this.state ={
            registerEmail: '',
            registerPassword: ''
        }

    }
    submitHandler = e => {
        e.preventDefault();
        console.log(this.state);
    }


    render(){
        const {registerEmail, registerPassword} = this.state;
        return(
        <form onSubmit={this.submitHandler} >
            <Label required>Email Intended</Label>
            <InputGroup>
                <Button variant="primary" size="icon">
                    <Icon icon="ChevronRight" />
                </Button>
                <Input required id="registeremail" value={registerEmail}/>
                <Label>use domain @swaggy.com </Label>
                <Button variant="primary" size="icon">
                    <Icon icon="ChevronRight" />
                </Button>
            </InputGroup>
            <Label required>Password Intended</Label>
            <InputGroup >
                <Button variant="primary" size="icon">
                    <Icon icon="ChevronRight" />
                </Button>
                <Input required id="registerpassword" value = {registerPassword}/>
                <Button variant="primary" size="icon">
                    <Icon icon="ChevronRight" />
                </Button>
            </InputGroup>
            <br/>
            <Button type={"submit"}>Generate Agent</Button>
        </form>

        )
}
}

export default PostForm
