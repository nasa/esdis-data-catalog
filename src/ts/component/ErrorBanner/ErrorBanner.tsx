import React from 'react'
import Alert from 'react-bootstrap/Alert'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'

interface ErrorBannerProps {
  message: string;
  dataTestId?: string;
  role?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  dataTestId = 'error-banner__message',
  role = ''
}) => (
  <Row>
    <Col>
      <Alert variant="danger" role={role}>
        <Alert.Heading>Sorry!</Alert.Heading>
        <p data-testid={dataTestId}>{message}</p>
      </Alert>
    </Col>
  </Row>
)

export default ErrorBanner
