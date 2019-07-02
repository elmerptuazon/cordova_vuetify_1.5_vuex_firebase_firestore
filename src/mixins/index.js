// mint components
import { MessageBox } from 'mint-ui';
import { Indicator } from 'mint-ui';
import 'mint-ui/lib/message-box/style.css';
import 'mint-ui/lib/indicator/style.css';
import 'mint-ui/lib/spinner/style.css';
import Dialog from '@/components/Dialog';
import CheckMark from '@/components/CheckMark';
// import {StarRating} from 'vue-rate-it';
import { mapGetters } from 'vuex';
import Logo from '@/components/CompanyLogo';
import BottomNav from '@/components/BottomNav';

export const mixins = {
  data: () => ({
    basicRules: [
      v => !!v || 'This field is required'
    ],
    passwordRules: [
      v => !!v || 'Password is required'
    ],
    mobileRules: [
      v => !!v || 'Mobile number is required',
      v => (v && v.length === 11) || 'Mobile must be 11 digits'
    ],
    emailRules: [
      v => !!v || 'E-mail is required',
      v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
    ],
    numberRules: [
      v => !!v || 'This field is required',
      v => /^\d+$/.test(v) || 'Not a valid number.'
    ]
  }),
  methods: {
    MessageBox() {
      return {
        alert: () => {
          MessageBox.alert('Success', 'Hello WOrld', {
            confirmButtonText: 'Okay',
            confirmButtonClass: 'grey--text text--darken-2'
          })
        }
      }
    },
    Indicator(text = null) {
      return {
        open: () => {
          Indicator.open({
            text,
            spinnerType: 'snake'
          })
        },
        close: () => {
          setTimeout(() => {
            Indicator.close()
          }, 250);
        }
      }
    },
    makeId() {
      let text = ""
      let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

      for (let i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length))

      return text
    },
    disableBackButton() {
      document.addEventListener('deviceready', onDeviceReady, false)
      function onDeviceReady() {
        document.addEventListener('backbutton', function (e) {
          e.preventDefault()
        }, false)
      }
    },
    calculateAspectRatioFit(srcWidth, srcHeight, maxWidth = 100, maxHeight = 100) {
      const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight)
      return { width: srcWidth * ratio, height: srcHeight * ratio }
    },
    createFakeImage(src) {
      return new Promise((resolve) => {
        const img = new Image()

        img.onload = () => {
          console.log(img.naturalWidth, img.naturalHeight)
          resolve(this.calculateAspectRatioFit(img.naturalWidth, img.naturalHeight));
        }

        img.src = src
      })
    },
    cordovaBackButton(method) {
      document.addEventListener("backbutton", function (e) {
        method();
        e.preventDefault();
        return;
      }, false);
    }
  },
  computed: {
    ...mapGetters([
      'GET_SHOW_TABS',
      'GET_TOOLBAR_TITLE',
      'GET_EXTENDED_TOOLBAR'
    ])
  },
  components: {
    Dialog,
    CheckMark,
    Logo,
    BottomNav
  }
}

