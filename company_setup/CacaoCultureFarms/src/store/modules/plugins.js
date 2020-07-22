const plugins = {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
    async TAKE_PHOTO({ dispatch }, sourceType) {
      try {
        const data = await dispatch('UPLOAD_IMAGE', {
          targetHeight: 180,
          targetWidth: 178,
          sourceType: sourceType
        });
        return data;
      } catch (error) {
        throw error;
      }
    },

    async TAKE_PHOTO_FOR_REGISTRATION({ dispatch }, sourceType) {
      try {
        const data = await dispatch('UPLOAD_IMAGE', {
          sourceType: sourceType
        });
        return data;
      } catch (error) {
        throw error;
      }
    },

    async TAKE_PHOTO_FOR_PAYMENT({ dispatch }, sourceType) {
      try {
        const data = await dispatch('UPLOAD_IMAGE_URI', {
          sourceType: sourceType
        });
        return data;
      } catch (error) {
        throw error;
      }
    },

    async UPLOAD_ATTACHMENT({ dispatch }, { sourceType }) {
      try {
        const data = await dispatch('UPLOAD_IMAGE', {
          sourceType: sourceType
        });
        return data;
      } catch (error) {
        throw error;
      }
    },

    UPLOAD_IMAGE({ }, { targetHeight, targetWidth, sourceType }) {
      return new Promise((resolve, reject) => {
        const navCamera = navigator.camera
        const opts = {
          quality: 100,
          destinationType: navCamera.DestinationType.DATA_URL,
          encodingType: navCamera.EncodingType.JPEG,
          sourceType: sourceType === 'camera' ? navCamera.PictureSourceType.CAMERA : navCamera.PictureSourceType.PHOTOLIBRARY,
          mediaType: navCamera.MediaType.PICTURE,
          correctOrientation: true,
          cameraDirection: 1
        }

        if (targetHeight) {
          opts.targetHeight = targetHeight;
        }

        if (targetWidth) {
          opts.targetWidth = targetWidth;
        }

        navCamera.getPicture(
          (data) => resolve(`data:image/jpeg;base64,${data}`),
          (err) => reject(err), opts);
      });
    },

    UPLOAD_IMAGE_URI({ }, { targetHeight, targetWidth, sourceType }) {
      return new Promise((resolve, reject) => {
        const navCamera = navigator.camera
        const opts = {
          quality: 90,
          destinationType: navCamera.DestinationType.DATA_URL,
          encodingType: navCamera.EncodingType.JPEG,
          sourceType: sourceType === 'camera' ? navCamera.PictureSourceType.CAMERA : navCamera.PictureSourceType.PHOTOLIBRARY,
          mediaType: navCamera.MediaType.PICTURE,
          correctOrientation: true,
          cameraDirection: 1
        }

        if (targetHeight) {
          opts.targetHeight = targetHeight;
        }

        if (targetWidth) {
          opts.targetWidth = targetWidth;
        }

        navCamera.getPicture(
          (data) => resolve(`data:image/jpeg;base64,${data}`),
          (err) => reject(err), opts);
      });
    }
  }
}

export default plugins

