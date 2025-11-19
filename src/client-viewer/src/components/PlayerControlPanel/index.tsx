import React, { useEffect, useState, useCallback } from 'react';
import {
  Alignment,
  Button,
  Card,
  H5,
  Switch,
  Divider,
  Text,
  Icon,
  Tooltip,
  Position,
  Popover,
  Classes,
} from '@blueprintjs/core';
import screenfull from 'screenfull';
import { useTranslation } from 'react-i18next';
import FullScreenEnter from '../../images/fullscreen_24px.svg';
import FullScreenExit from '../../images/fullscreen_exit-24px.svg';
import { Col, Row } from 'react-flexbox-grid';
import {
  VideoQuality,
  type VideoQualityType,
} from '../../features/VideoAutoQualityOptimizer/VideoQualityEnum';
import { handlePlayerToggleFullscreen } from './handlePlayerToggleFullscreen';
import initScreenfullOnChange from './initScreenfullOnChange';
import { ScreenSharingSource } from '../../features/PeerConnection/ScreenSharingSourceEnum';
import './index.css';

const videoQualityButtonStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
};

interface PlayerControlPanelProps {
  onSwitchChangedCallback: (isEnabled: boolean) => void;
  isPlaying: boolean;
  isDefaultPlayerTurnedOn: boolean;
  handleClickFullscreen: () => 'entered' | 'exited' | 'failed';
  handleClickPlayPause: () => void;
  setVideoQuality: (q: VideoQualityType) => void;
  selectedVideoQuality: VideoQualityType;
  screenSharingSourceType: ScreenSharingSourceType;
  isFlipped: boolean;
  toggleFlip: () => void;
  // toaster: undefined | HTMLDivElement;
}

function PlayerControlPanel(props: PlayerControlPanelProps) {
  const { t } = useTranslation();
  const {
    onSwitchChangedCallback,
    isPlaying,
    isDefaultPlayerTurnedOn,
    handleClickPlayPause,
    handleClickFullscreen,
    selectedVideoQuality,
    setVideoQuality,
    screenSharingSourceType,
    isFlipped,
    toggleFlip,
  } = props;

  const isFullScreenAPIAvailable = screenfull.isEnabled;

  const [isFullScreenOn, setIsFullScreenOn] = useState(false);

  useEffect(() => {
    const cleanup = initScreenfullOnChange(setIsFullScreenOn);
    return cleanup;
  }, []);

  const handleClickFullscreenWhenDefaultPlayerIsOn = useCallback(() => {
    const result = handlePlayerToggleFullscreen();
    if (result === 'failed') {
      console.warn('Unable to toggle fullscreen');
      return result;
    }
    setIsFullScreenOn(result === 'entered');
    return result;
  }, [setIsFullScreenOn]);

  const handlePlayPauseClick = useCallback(() => {
    handleClickPlayPause();
  }, [handleClickPlayPause]);

  const handleVideoQualitySelect = useCallback(
    (quality: VideoQualityType) => {
      setVideoQuality(quality);
    },
    [setVideoQuality]
  );

  const handleDefaultPlayerToggle = useCallback(() => {
    const nextState = !isDefaultPlayerTurnedOn;
    onSwitchChangedCallback(nextState);
  }, [isDefaultPlayerTurnedOn, onSwitchChangedCallback]);

  const handleFullscreenClick = useCallback(() => {
    const result = isDefaultPlayerTurnedOn
      ? handleClickFullscreenWhenDefaultPlayerIsOn()
      : handleClickFullscreen();
    if (result === 'failed') {
      return;
    }
  }, [handleClickFullscreen, handleClickFullscreenWhenDefaultPlayerIsOn, isDefaultPlayerTurnedOn]);

  return (
    <>
      <Card elevation={4} style={{ padding: '8px' }}>
        <Row between='xs' middle='xs'>
          <Col xs={12} md={3}>
            <Row middle='xs' start='xs'>
              <Col xs>
                <H5 style={{ margin: 0 }}>Web Viewer</H5>
              </Col>
            </Row>
          </Col>
          <Col xs={12} md={5}>
            <Row center='xs' style={{ height: '32px' }}>
              <Row
                center='xs'
                middle='xs'
                style={{
                  borderRadius: '20px',
                  backgroundColor: '#137CBD',
                  width: '190px',
                  height: '100%',
                }}
              >
                <Row style={{ width: '100%' }} middle='xs' center='xs'>
                  <Button
                    minimal
                    onClick={handlePlayPauseClick}
                    style={{
                      width: '85px',
                      minWidth: '70px',
                      color: 'white',
                      padding: '0 5px',
                      minHeight: '24px',
                    }}
                  >
                    <Row>
                      <Col xs>
                        <Icon icon={isPlaying ? 'pause' : 'play'} color='white' size={14} />
                      </Col>
                      <Col xs>
                        <Text className='bp3-text-large play-pause-text' style={{ fontSize: '14px' }}>
                          {isPlaying ? t('Pause') : t('Play')}
                        </Text>
                      </Col>
                    </Row>
                  </Button>
                  <Divider
                    style={{
                      height: '16px',
                      borderRight: '1px solid #ffffffa8',
                      borderBottom: '1px solid #ffffffa8',
                    }}
                  />
                  <Popover
                    content={
                      <>
                        <H5>{`${t('Video Settings')}:`}</H5>
                        <Divider />
                        <Row style={{
                          justifyContent: 'center',
                        }}>
                          <Tooltip content={t('Flip Screen')} position={Position.TOP}>
                            <span style={{ display: 'block', width: '100%', textAlign: 'center' }}>
                              <Button
                                icon='key-tab'
                                minimal
                                style={videoQualityButtonStyle}
                                onClick={toggleFlip}
                                active={isFlipped}
                              >
                                {t('Flip')}
                              </Button>
                            </span>
                          </Tooltip>
                        </Row>
                        <Divider />
                        {Object.values(VideoQuality).map((q: VideoQualityType) => {
                          return (
                            <Row key={q}>
                              <Button
                                minimal
                                active={selectedVideoQuality === q}
                                style={videoQualityButtonStyle}
                                disabled={screenSharingSourceType === ScreenSharingSource.WINDOW}
                                onClick={() => {
                                  handleVideoQualitySelect(q);
                                  // toaster?.show({
                                  //   icon: 'clean',
                                  //   intent: Intent.PRIMARY,
                                  //   message: `${t(
                                  //     'Video quality has been changed to'
                                  //   )} ${q}`,
                                  // });
                                }}
                              >
                                {q}
                              </Button>
                            </Row>
                          );
                        })}
                      </>
                    }
                    position={Position.BOTTOM}
                    popoverClassName={Classes.POPOVER_CONTENT_SIZING}
                  >
                    <Tooltip content={t('Click to Open Video Settings')} position={Position.BOTTOM}>
                      <Button minimal style={{ minHeight: '24px' }}>
                        <Icon icon='cog' color='white' size={14} />
                      </Button>
                    </Tooltip>
                  </Popover>

                  <Divider
                    style={{
                      height: '16px',
                      borderRight: '1px solid #ffffffa8',
                      borderBottom: '1px solid #ffffffa8',
                    }}
                  />
                  <Tooltip
                    content={t('Click to Enter Full Screen Mode')}
                    position={Position.BOTTOM}
                  >
                    <Button
                      minimal
                      onClick={handleFullscreenClick}
                      style={{ minHeight: '24px' }}
                    >
                      <img
                        src={isFullScreenOn ? FullScreenExit : FullScreenEnter}
                        width={14}
                        height={14}
                        style={{
                          transform: 'scale(1.2) translateY(1px)',
                          filter:
                            'invert(100%) sepia(100%) saturate(0%) hue-rotate(127deg) brightness(107%) contrast(102%)',
                        }}
                        alt='fullscreen-toggle'
                      />
                    </Button>
                  </Tooltip>
                </Row>
              </Row>
            </Row>
          </Col>
          <Col xs={12} md={3}>
            <Row end='xs'>
              <Col xs={12}>
                <Switch
                  onChange={handleDefaultPlayerToggle}
                  innerLabel={isDefaultPlayerTurnedOn ? t('ON') : t('OFF')}
                  inline
                  label={t('Default Video Player')}
                  alignIndicator={Alignment.RIGHT}
                  checked={isDefaultPlayerTurnedOn}
                  disabled={!isFullScreenAPIAvailable}
                  style={{
                    marginBottom: '0',
                    marginTop: '0',
                  }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </>
  );
}

export default PlayerControlPanel;
