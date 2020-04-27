// @ts-ignore
import React from 'react'
import styled from 'styled-components'
import {AreaChart, Area, Tooltip, ResponsiveContainer,
} from 'recharts';
// @ts-ignore
import image from 'react-bootstrap/image'

import { Box, H2, H5, H4, Text, InfoBox, InfoBoxProps,Illustration, IllustrationProps, Button, Icon, Table, TableRow, TableCell, TableCaption, TableHead, TableBody, Link, CheckBox} from 'admin-bro'
import { useTranslation } from 'admin-bro'
import Image from "react-bootstrap/Image";


const pageHeaderHeight = 284
const pageHeaderPaddingY = 74
const pageHeaderPaddingX = 250


const DashboardHeader = () => {
    const { translateMessage } = useTranslation();
    return (
        <Box position="relative" overflow="hidden">
        <Box
    position="absolute"
    top={50}
    left={-10}
    opacity={[0.2, 0.4, 1]}
    animate
    >
    <Illustration variant="Rocket" />
        </Box>
        <Box
    position="absolute"
    top={-70}
    right={-15}
    opacity={[0.2, 0.4, 1]}
    animate
    >
    <Illustration variant="Moon" />
        </Box>
        <Box
    bg="grey100"
    height={pageHeaderHeight}
    py={pageHeaderPaddingY}
    px={['default', 'lg', pageHeaderPaddingX]}
>
<Text textAlign="center" color="white">
        <H2>Welcome to the Admin Panel !</H2>
    <Text opacity="0.8">
        We have compiled the Basic necessities of every admin of a CSA system. Check out the tabs on the left and bottom
</Text>
    </Text>
    </Box>
    </Box>
)
}

const boxes = ({ translateMessage }) => [{
    variant: 'Planet',
    title: "Rainbow Powered",
    subtitle: "Click here to login to your CSA via Rainbow",
    href: 'https://web-sandbox.openrainbow.com/app/1.69.3/index.html',
}, {
    variant: 'DocumentCheck',
    title: 'Full Ticket Tracking',
    subtitle: 'We provide amazing tracking systems for tickets. Click here to check it out ...',
    href: 'admin/resources/Log%20Sessions',
}, {
    variant: 'DocumentSearch',
    title: "Our API Docs",
    subtitle: 'Powered by Express, we handcrafted our own APIs. See more ...',
    href: 'https://documenter.getpostman.com/view/10629994/Szf54UrQ?version=latest#1bdd109b-ca0f-40cc-874c-ccd6a2',
}, {
    variant: 'FlagInCog',
    title: 'Control Agent Abilities',
    subtitle: 'Specify/Create/Modify deployed Agents here. Changes happen real-time',
    href: '/admin/resources/Agent',
}, {
    variant: 'Folders',
    title: 'Adjust Admin Access',
    subtitle: 'Due to nature of demo, we have kept this option disabled. Contact us for more..',
    href: '/admin',
}, {
    variant: 'Astronaut',
    title: 'Dialogflow Bots',
    subtitle: "Control your BOT policy here. We offer fine-grain controls. Fully Rainbow Integrated",
    href: 'admin/resources/AdminPolicy',
}]

const Card = styled(Box)`
  display: ${({ flex }): string => (flex ? 'flex' : 'block')};
  color: ${({ theme }): string => theme.colors.grey100};
  text-decoration: none;
  border: 1px solid transparent;
  &:hover {
    border: 1px solid ${({ theme }): string => theme.colors.primary100};
    box-shadow: ${({ theme }): string => theme.shadows.cardHover};
  }
`

Card.defaultProps = {
    variant: 'white',
    boxShadow: 'card',
}

const Dashboard =  (props) => {
    const { translateMessage, translateButton } = useTranslation()
    return (
        <Box>
        <DashboardHeader />
        <Box
    mt={['xl', 'xl', '-100px']}
    mb="xl"
    mx={[0, 0, 0, 'auto']}
    px={['default', 'lg', 'xxl', '0']}
    position="relative"
    flex
    flexDirection="row"
    flexWrap="wrap"
    width={[1, 1, 1, 1024]}
>
    {boxes({ translateMessage }).map((box, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Box key={index} width={[1, 1 / 2, 1 / 2, 1 / 3]} p="lg">
    <Card as="a" href={box.href}>
        <Text textAlign="center">
        <Illustration
        variant={box.variant as IllustrationProps['variant']}
        width={100}
        height={70}
        />
        <H5 mt="lg">{box.title}</H5>
        <Text>{box.subtitle}</Text>
        </Text>
        </Card>
        </Box>
    ))}

<Box width={[1, 1, 1 ]} p="lg">
    <Card as="a" href="/admin/resources/Log%20Sessions" >
        <H4>Missed/Nullified Tickets </H4>
    <Table flex>
        <TableHead>
            <TableRow>
                <TableCell>
                    <Link href="#">
                        Client email
                        <Icon icon="CaretUp" />
                    </Link>
                </TableCell>
                <TableCell>
                    <Link href="#">
                        Department Requested
                        <Icon icon="CaretDown" />
                    </Link>
                </TableCell>
                <TableCell>Type of Communication</TableCell>
                <TableCell>Time of Log</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            <TableRow>
                <TableCell>recaro8134@gmail.com</TableCell>
                <TableCell>Graduate Office</TableCell>
                <TableCell>Chat</TableCell>
                <TableCell>3/31/2020, 11:12:00 PM</TableCell>
            </TableRow>
            <TableRow>
                <TableCell>wombat65@yahoo.com</TableCell>
                <TableCell>General Enquiry</TableCell>
                <TableCell>Audio</TableCell>
                <TableCell>3/31/2020, 1:57:00 AM</TableCell>

            </TableRow>
        </TableBody>
    </Table>
    </Card>
</Box>

 <Box width={[1, 1, 1 ]} p="lg">
     <Card as="a"  href= 'admin/pages/accountGeneration'>
    <InfoBox title="Add New Agents into Rainbow">
        <Text>The following will actually add Agents dynamically into the system, including activation of Rainbow Platform</Text>
        <Text>To create first click</Text>
        <Button mt="lg" href='admin/pages/accountGeneration'><Icon icon="Add" />Create</Button>
    </InfoBox>
    </Card>
</Box>


<Box width={[1, 1, 1 / 2]} p="lg">
    <Card as="a" flex href="https://github.com/oliviergoals/full_website">
        <Box flexShrink={0}><Image src="https://i.imgur.com/QgRDTqG.png?1" /></Box>
        <Box ml="xl">
        <H4>Checkout our Client App </H4>
    <Text>As part of the project, we also have a fully functional Client App. Do check it out!</Text>
    </Box>
    </Card>
    </Box>
    <Box width={[1, 1, 1 / 2]} p="lg">
    <Card as="a" flex href="https://github.com/sheikhshack/openrainbow-poc-50.003">
        <Box flexShrink={0}><Illustration variant="GithubLogo" /></Box>
        <Box ml="xl">
        <H4>Visit Our Swaggy Github!</H4>
    <Text>Our Source code will be fully published as part of the 50.003 course. Please do visit us!</Text>
    </Box>
    </Card>
    </Box>
    <Box variant="white" boxShadow="card" width={1} m="lg">
        <Text textAlign="center">
        <Illustration variant="Rocket" />
        <H4>Like what you see?</H4>
    <Text>We utilise many frameworks to make this happen. Contact us below and share with us your feedback! </Text>
    <Text mt="xxl">
    <Button
    as="a"
    size="sm"
    variant="primary"
    href="mailto:sheikhsalim@mymail.sutd.edu.sg"
        >
        {translateButton('contactUs')}
</Button>
    </Text>
    </Text>
    </Box>
    </Box>
    </Box>
)
}

export default Dashboard
