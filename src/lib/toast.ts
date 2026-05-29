import { useToastStore, type ToastStatusType } from "../model/stores/useToastStore.js";

type ShowToastOptions = {
    msg: string;
    time?: number;
    type?: ToastStatusType;
};

export function showToast({ msg, time = 3, type = "info" }: ShowToastOptions) {
    useToastStore.getState().setToast({ msg, time, type });
}

export function showSuccessToast(msg: string, time = 3) {
    showToast({ msg, time, type: "success" });
}

export function showErrorToast(msg: string, time = 3) {
    showToast({ msg, time, type: "fail" });
}
