import  { Box, H2, H5, H4, Text, Illustration, IllustrationProps, Button } from 'admin-bro'
import styled from 'styled-components'



const Card = styled(Box)`
  display: ${({ flex }): string => (flex ? 'flex' : 'block')};
  color: ${({ theme }): string => theme.colors.grey100};
  text-decoration: none;
  border: 1px solid transparent;
  &:hover {
    border: 1px solid ${({ theme }): string => theme.colors.primary100};
    box-shadow: ${({ theme }): string => theme.shadows.cardHover};
  }
`;

Card.defaultProps = {
    variant: 'white',
    boxShadow: 'card',
};

<Card as="a" href={box.href}> </Card>
