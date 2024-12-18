import React from 'react'

import Row from 'react-bootstrap/Row'
import Spinner from 'react-bootstrap/Spinner'

interface LoadingBannerProps {
  dataTestId?: string;
}

export const LoadingBanner: React.FC<LoadingBannerProps> = ({
  dataTestId = 'loading-banner__spinner'

}) => (
  <Row className="justify-content-center mt-5">
    <Spinner animation="grow" variant="primary" data-testid={dataTestId} />
  </Row>
)

export default LoadingBanner
