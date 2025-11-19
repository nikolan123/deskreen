import { Device } from '../../common/Device';

export const nullDevice: Device = {
	id: '',
	sharingSessionID: '',
	deviceOS: '',
	deviceType: '',
	deviceIP: '',
	deviceBrowser: '',
	deviceScreenWidth: -1,
	deviceScreenHeight: -1,
	deviceRoomId: '',
};

const SLOT_VIOLATION_MESSAGE = 'viewer slot operation failed';

type ViewerConnectionAvailability = 'available' | 'occupied';

class MultipleViewerSlots {
	private devices: Map<string, Readonly<Device>> = new Map();

	occupy(device: Device): void {
		// Allow multiple devices - just add or update
		this.devices.set(device.id, Object.freeze({ ...device }));
	}

	releaseById(deviceIDToRemove: string): boolean {
		if (!this.devices.has(deviceIDToRemove)) {
			return false;
		}
		this.devices.delete(deviceIDToRemove);
		return true;
	}

	release(): void {
		this.devices.clear();
	}

	isAvailable(): boolean {
		// Always available for new connections
		return true;
	}

	snapshot(): Device[] {
		return Array.from(this.devices.values()).map(device => ({ ...device }));
	}

	isOccupiedBy(deviceID: string): boolean {
		return this.devices.has(deviceID);
	}

	count(): number {
		return this.devices.size;
	}
}

export class ConnectedDevicesService {
	private readonly slot = new MultipleViewerSlots();

	pendingConnectionDevice: Device = nullDevice;

	private readonly availabilityListeners = new Set<(state: ViewerConnectionAvailability) => void>();

	resetPendingConnectionDevice(): void {
		this.pendingConnectionDevice = nullDevice;
	}

	getDevices(): Device[] {
		return this.slot.snapshot();
	}

	isSlotAvailable(): boolean {
		return this.slot.isAvailable();
	}

	addAvailabilityListener(
		listener: (state: ViewerConnectionAvailability) => void,
	): () => void {
		this.availabilityListeners.add(listener);
		listener(this.getAvailabilityState());
		return () => {
			this.availabilityListeners.delete(listener);
		};
	}

	disconnectAllDevices(): void {
		this.slot.release();
		this.notifyAvailabilityListeners();
	}

	disconnectDeviceByID(deviceIDToRemove: string): Promise<undefined> {
		return new Promise<undefined>((resolve) => {
			this.slot.releaseById(deviceIDToRemove);
			this.notifyAvailabilityListeners();
			resolve(undefined);
		});
	}

	addDevice(device: Device): void {
		try {
			this.slot.occupy(device);
		} catch (error) {
			if (error instanceof Error && error.message === SLOT_VIOLATION_MESSAGE) {
				throw error;
			}
			throw error;
		}
		this.notifyAvailabilityListeners();
	}

	setPendingConnectionDevice(device: Device): void {
		this.pendingConnectionDevice = device;
	}

	private getAvailabilityState(): ViewerConnectionAvailability {
		return this.slot.isAvailable() ? 'available' : 'occupied';
	}

	private notifyAvailabilityListeners(): void {
		const state = this.getAvailabilityState();
		this.availabilityListeners.forEach((listener) => {
			try {
				listener(state);
			} catch (error) {
				console.error('connected devices availability listener failed', error);
			}
		});
	}
}
