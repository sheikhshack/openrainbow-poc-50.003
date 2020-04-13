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
        <H2>{translateMessage('welcomeOnBoard_title')}</H2>
    <Text opacity="0.8">
        {translateMessage('welcomeOnBoard_subtitle')}
</Text>
    </Text>
    </Box>
    </Box>
)
}

const boxes = ({ translateMessage }) => [{
    variant: 'Planet',
    title: "FUCK ME IF THIS WORKS",
    subtitle: translateMessage('addingResources_subtitle'),
    href: 'google.com',
}, {
    variant: 'DocumentCheck',
    title: translateMessage('customizeResources_title'),
    subtitle: translateMessage('customizeResources_subtitle'),
    href: 'https://softwarebrothers.github.io/admin-bro-dev/tutorial-04-customizing-resources.html',
}, {
    variant: 'DocumentSearch',
    title: translateMessage('customizeActions_title'),
    subtitle: translateMessage('customizeActions_subtitle'),
    href: 'https://softwarebrothers.github.io/admin-bro-dev/tutorial-05-actions.html',
}, {
    variant: 'FlagInCog',
    title: translateMessage('writeOwnComponents_title'),
    subtitle: translateMessage('writeOwnComponents_subtitle'),
    href: 'https://softwarebrothers.github.io/admin-bro-dev/tutorial-06-writing-react-components.html',
}, {
    variant: 'Folders',
    title: translateMessage('customDashboard_title'),
    subtitle: translateMessage('customDashboard_subtitle'),
    href: 'https://softwarebrothers.github.io/admin-bro-dev/tutorial-07-custom-dashboard.html',
}, {
    variant: 'Astronaut',
    title: translateMessage('roleBasedAccess_title'),
    subtitle: translateMessage('roleBasedAccess_subtitle'),
    href: 'https://softwarebrothers.github.io/admin-bro-dev/tutorial-08-rbac.html',
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
        <H4>Most Recent Tickets Serviced </H4>
    <Table flex>
        <TableHead>
            <TableRow>
                <TableCell>
                    <Link href="#">
                        Name
                        <Icon icon="CaretUp" />
                    </Link>
                </TableCell>
                <TableCell>
                    <Link href="#">
                        Last
                        <Icon icon="CaretDown" />
                    </Link>
                </TableCell>
                <TableCell>Surname</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Age</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            <TableRow>
                <TableCell>Value 1</TableCell>
                <TableCell>Value 2</TableCell>
                <TableCell>Value 2</TableCell>
                <TableCell>Value 2</TableCell>
                <TableCell>Value 2</TableCell>
            </TableRow>
            <TableRow>
                <TableCell>Value 1</TableCell>
                <TableCell>Value 2</TableCell>
                <TableCell>Value 2</TableCell>
                <TableCell>Value 2</TableCell>
                <TableCell>Value 2</TableCell>
            </TableRow>
        </TableBody>
    </Table>
    </Card>
</Box>

 <Box width={[1, 1, 1 ]} p="lg">
    <InfoBox title="Add New Agents into Rainbow">
        <Text>The following will actually add Agents dynamically into the system, including activation of Rainbow Platform</Text>
        <Text>To create first click</Text>
        <Button mt="lg"><Icon icon="Add" />Create</Button>
    </InfoBox>

</Box>


<Box width={[1, 1, 1 / 2]} p="lg">
    <Card as="a" flex href="https://google.com">
        <Box flexShrink={0}><Image src="https://i.imgur.com/QgRDTqG.png?1" /></Box>
        <Box ml="xl">
        <H4>Checkout our Client App </H4>
    <Text>As part of the project, we also have a fully functional Client App. Do check it out!</Text>
    </Box>
    </Card>
    </Box>
    <Box width={[1, 1, 1 / 2]} p="lg">
    <Card as="a" flex href="https://github.com/SoftwareBrothers/admin-bro/issues">
        <Box flexShrink={0}><Illustration variant="GithubLogo" /></Box>
        <Box ml="xl">
        <H4>Visit Our Swaggy Github!</H4>
    <Text>Our Source code will be fully published as part of the 50.003 course. Please do visit us!</Text>
    </Box>
    </Card>
    </Box>
    <Box variant="white" boxShadow="card" width={1} m="lg">
        <Text textAlign="center">
        <Illustration variant="SoftwareBrothersLogo" />
        <H4>{translateMessage('needMoreSolutions_title')}</H4>
    <Text>{translateMessage('needMoreSolutions_subtitle')}</Text>
    <Text mt="xxl">
    <Button
    as="a"
    size="sm"
    variant="primary"
    href="https://softwarebrothers.co/services"
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
