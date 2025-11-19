import { Row, Col } from 'react-flexbox-grid';
import { useTranslation } from 'react-i18next';
import { LIGHT_UI_BACKGROUND } from '../../constants/styleConstants';
import MyDeviceInfoCard from '../../components/MyDeviceInfoCard';
import type { TFunction } from 'i18next';
import { Button, H3 } from '@blueprintjs/core';

interface ConnectionPropmptsProps {
  myDeviceDetails: DeviceDetails;
  isShownTextPrompt: boolean;
  promptStep: number;
  connectionIconType: ConnectionIconType;
  isShownSpinnerIcon: boolean;
  spinnerIconType: LoadingSharingIconType;
}

function getPromptContent(t: TFunction, step: number) {
  switch (step) {
    case 1:
      return (
        <H3>
          Please accept the connection request on the screen sharing device.
        </H3>
      );
    case 2:
      return <H3>{t('Connected!') as string}</H3>;
    case 3:
      return (
        <H3>
          Please select the source to share from the screen sharing device.
        </H3>
      );
    default:
      return <H3>{`${t('Error occurred')} :(`}</H3>;
  }
}

function ConnectionPropmpts(props: ConnectionPropmptsProps) {
  const {
    myDeviceDetails,
    promptStep
  } = props;

  const { t } = useTranslation();

  const handleReinitiateConnection = () => {
    window.location.reload();
  };

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 10,
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        boxShadow: '0 0 0 5px #A7B6C2',
        backgroundColor: LIGHT_UI_BACKGROUND,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          width: '100%',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        {/* Header */}
        <H3 style={{ marginBottom: '30px' }}>Web Viewer</H3>

        {/* Status Message */}
        <div style={{ fontSize: '20px', marginBottom: '30px' }}>
          {getPromptContent(t, promptStep)}
        </div>

        {/* Device Info Card */}
        <Row center="xs" style={{ marginBottom: '30px' }}>
          <Col md={8} lg={6}>
            <MyDeviceInfoCard deviceDetails={myDeviceDetails} />
          </Col>
        </Row>

        {/* Restart Button */}
        <Button
          className="rounded-pill-button"
          intent="warning"
          onClick={handleReinitiateConnection}
          large
        >
          Restart Connection
        </Button>
      </div>
    </div>
  );
}

export default ConnectionPropmpts;
