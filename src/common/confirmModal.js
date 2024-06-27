import { Modal } from "antd";

const ModalPop = (
    title,
    content,
    handleOk,
    handleCancel,
    isVisible,
    okText = "Ok",
    cancelText = "Cancel"
) => {
    Modal.confirm({
        className: "modalConfirm",
        title: title,
        visible: isVisible,
        onOk: handleOk,
        onCancel: handleCancel,
        centered: true,
        zIndex: 99999,
        content: content,
        okText,
        cancelText,
    });
};
export default ModalPop;