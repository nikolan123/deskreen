import DesktopCapturerSourceType from '../../../../common/DesktopCapturerSourceType';
import getDesktopSourceStreamBySourceID from './getDesktopSourceStreamBySourceID';
import prepareDataMessageToSendScreenSourceType from './prepareDataMessageToSendScreenSourceType';
import NullSimplePeer from './NullSimplePeer';

export default async function handlePeerOnData(
	peerConnection: PeerConnection,
	data: string,
): Promise<void> {
	const dataJSON = JSON.parse(data);

	if (dataJSON.type === 'set_video_quality') {
		const maxVideoQualityMultiplier = dataJSON.payload.value;
		const minVideoQualityMultiplier =
			maxVideoQualityMultiplier === 1 ? 0.5 : maxVideoQualityMultiplier;

		if (!peerConnection.desktopCapturerSourceID.includes(DesktopCapturerSourceType.SCREEN)) return;

		const newStream = await getDesktopSourceStreamBySourceID(
			peerConnection.desktopCapturerSourceID,
			peerConnection.sourceDisplaySize?.width,
			peerConnection.sourceDisplaySize?.height,
			minVideoQualityMultiplier,
			maxVideoQualityMultiplier,
			60,
			60,
		);
		const newVideoTrack = newStream.getVideoTracks()[0];
		
		// Always use the original stream that was added to the peer connection
		const streamToModify = peerConnection.localStream;
		const oldTrack = streamToModify?.getVideoTracks()[0];

		if (oldTrack && streamToModify && peerConnection.peer !== NullSimplePeer) {
			await peerConnection.peer.replaceTrack(oldTrack, newVideoTrack, streamToModify);
			
			// Remove old track from the stream and add new track
			streamToModify.removeTrack(oldTrack);
			streamToModify.addTrack(newVideoTrack);
			
			// Stop the old track
			oldTrack.stop();
			
			// Stop any other tracks from the new stream (we only need the video track)
			newStream.getTracks().forEach((track) => {
				if (track.id !== newVideoTrack.id) {
					track.stop();
				}
			});
		}
	}

	if (dataJSON.type === 'get_sharing_source_type') {
		const sourceType = peerConnection.desktopCapturerSourceID.includes(
			DesktopCapturerSourceType.SCREEN,
		)
			? DesktopCapturerSourceType.SCREEN
			: DesktopCapturerSourceType.WINDOW;

		peerConnection.peer.send(prepareDataMessageToSendScreenSourceType(sourceType));
	}
}
