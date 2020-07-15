<template>
  <div>
    <v-toolbar app color="primary" dark>
      <v-btn icon @click="goBack">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <BasketBadge tabName="msa" />
      <v-spacer></v-spacer>
      <Accounts />
    </v-toolbar>

    <v-container>
      <v-card class="mx-auto">
        <v-card-title>
          <span class="subheading font-weight-medium">Stock Order Details</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="body-2 font-weight-regular">
          <div>
            <div>
              <span
                >Reference Number: {{ stockOrder.stockOrderReference }}</span
              >
            </div>
            <div>
              Date Ordered:
              {{ stockOrder.submittedAt | momentify("DD-MMM-YYYY") }}
            </div>
            <div>
              Status:
              <v-chip
                :class="[
                  stockOrder.status.toLowerCase() != 'pending' ? 'green' : 'red darken-2'
                ]"
                text-color="white"
              >
                <span v-if="isScheduledForShipping">scheduled for shipping</span>
                <span v-else>{{ stockOrder.status }}</span>
              </v-chip>
            </div>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-title>
          <span class="subheading font-weight-medium">Payment Details</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <div>
            <span v-if="stockOrder.paymentDetails.paymentType === 'CC'"
              >Type: Credit Card</span
            >
            <span v-else-if="stockOrder.paymentDetails.paymentType === 'GCash'"
              >Type: GCash</span
            >
            <span v-else-if="stockOrder.paymentDetails.paymentType === 'GrabPay'"
              >Type: Grab Pay</span
            >
            <span v-else-if="stockOrder.paymentDetails.paymentType === 'POP'"
              >Type: Bank Receipt / Payment Receipt</span
            >
            <span v-else>Type: Cash on Delivery</span>
          </div>
          <div class="mt-3" v-if="stockOrder.paymentDetails.paymentType !== 'POP'">
            Amount Paid:
            {{ stockOrder.paymentDetails.amount | currency('&#8369;') }}
          </div>
          <div class="mt-3">
            Status:
            <v-chip
              :class="[
                stockOrder.paymentDetails.paymentStatus.toLowerCase() === '-'
                  ? 'red darken-2'
                  : '',
                stockOrder.paymentDetails.paymentStatus.toLowerCase() === 'pending'
                  ? 'yellow darken-2'
                  : '',
                stockOrder.paymentDetails.paymentStatus.toLowerCase() === 'paid'
                  ? 'green'
                  : '',
                stockOrder.paymentDetails.paymentStatus.toLowerCase() === 'denied'
                  ? 'red darken-2'
                  : ''
              ]"
              text-color="white"
            >
              <span v-if="
                stockOrder.paymentDetails.paymentStatus === 'pending' && 
                stockOrder.paymentDetails.paymentType === 'POP'
              "
              >proof of payment</span>
              <span v-else>{{ stockOrder.paymentDetails.paymentStatus }}</span>
            </v-chip>
          </div>

          <v-layout row align-center justify-center wrap mt-4 
            v-if="stockOrder.paymentDetails.paymentType === 'POP'"
          >
            <v-avatar tile size="200">
              <v-img
                v-if="stockOrder.paymentDetails.proofOfPayment"
                :src="stockOrder.paymentDetails.proofOfPayment"
                :lazy-src="Placeholder"
                max-height="250px"
                max-width="250px" 
                style="border: solid 1px;"
                @click="enlargeImage"
              >
                <v-layout
                  slot="placeholder"
                  fill-height
                  align-center
                  justify-center
                  ma-0
                >
                  <v-progress-circular
                    indeterminate
                    color="grey darken-2"
                  ></v-progress-circular>
                </v-layout>
              </v-img>

              <v-img 
                v-else
                :src="Placeholder" 
                :lazy-src="Placeholder"
                max-height="250px"
                max-width="250px" 
                style="border: solid 1px;"
              ></v-img>

              <v-btn
                v-if="
                  stockOrder.paymentDetails.paymentStatus === '-' || 
                  stockOrder.paymentDetails.paymentStatus === 'denied'
                "
                class="overlayImage"
                @click="sheet = true"
                depressed color="primary" dark small
              >
                <v-icon small class="mr-2">camera_alt</v-icon>
                <span v-if="!stockOrder.paymentDetails.proofOfPayment">Add Photo</span>
                <span v-else>Edit Photo</span>
              </v-btn>
            </v-avatar>
          </v-layout>
          <v-layout row align-center justify-center wrap mt-3>
            <v-flex xs10 class="text-xs-center" 
              v-if="
                  stockOrder.paymentDetails.proofOfPayment ||
                  stockOrder.paymentDetails.paymentStatus === '-' || 
                  stockOrder.paymentDetails.paymentStatus === 'denied'
                "
            >
              <v-btn 
                outline 
                color="black" 
                @click="enlargeImage"
                :disabled="!stockOrder.paymentDetails.proofOfPayment"
              >
                VIEW IMAGE
              </v-btn>
            </v-flex>
            <v-flex 
              xs10 class="text-xs-center" 
              v-if="
                  stockOrder.paymentDetails.paymentStatus === '-' || 
                  stockOrder.paymentDetails.paymentStatus === 'denied'
                "
            >
              <v-btn  
                color="red" outline 
                @click="removeProofOfPayment"
                :loading="uploadLoading"
                :disabled="!stockOrder.paymentDetails.proofOfPayment"
              >
                Remove Proof of Payment
              </v-btn>
            </v-flex>
            <v-flex 
              xs10 class="text-xs-center" 
              v-if="
                  stockOrder.paymentDetails.paymentStatus === '-' || 
                  stockOrder.paymentDetails.paymentStatus === 'denied'
                "
            >
              <v-btn  
                color="primary" depressed 
                @click="confirmUploadDialog = true"
                :loading="uploadLoading"
                :disabled="!stockOrder.paymentDetails.proofOfPayment"
              >
                Upload Proof of Payment
              </v-btn>
            </v-flex>
          </v-layout>

        </v-card-text>
        <v-divider></v-divider>
        <v-card-title>
          <span class="subheading font-weight-medium">Shipping Provider</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <div>
            <span v-if="stockOrder.logisticsDetails"
              >Provider:
              {{
                stockOrder.logisticsDetails.logisticProvider | uppercase
              }}</span
            >
            <span v-else>Provider: N/A</span>
          </div>
          <div>
            <span v-if="stockOrder.logisticsDetails">
              Shipping Fee: {{ 
                (stockOrder.logisticsDetails.resellersShippingFee || stockOrder.logisticsDetails.shippingFee) | currency('&#8369;') 
              }}
            </span>
            <span v-else>Shipping Fee: N/A</span>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
    <br />
    <table class="basket-table">
      <thead>
        <tr>
          <th class="border-bottom header-size grey--text text--darken-1">
            NAME
          </th>
          <th
            class="border-bottom text-xs-right header-size grey--text text--darken-1"
          >
            QTY
          </th>
          <th
            class="border-bottom text-xs-right header-size grey--text text--darken-1"
          >
            COST
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, i) in filterBy(
            orderBy(stockOrder.items, 'created_at', -1),
            search
          )"
          :key="i"
        >
          <td class="border-bottom">
            <v-layout row>
              <v-flex xs3>
                <v-avatar tile size="40px">
                  <v-img :src="item.image" :alt="item.name" contain></v-img>
                </v-avatar>
              </v-flex>
              <v-flex xs9>
                <span v-html="item.name" class="caption"></span>
                <br />
                <span class="caption">
                  {{ item.attributes | joinAttributes }}
                </span>
              </v-flex>
            </v-layout>
          </td>
          <td class="caption text-xs-right border-bottom">{{ item.qty }}</td>
          <td class="caption text-xs-right border-bottom">
            {{ (item.qty * item.resellerPrice) | currency('&#8369;') }}
          </td>
        </tr>
        <tr>
          <td colspan="3"></td>
        </tr>
        <!-- <tr>
          <td class="caption text-xs-right" colspan="2">
            Subtotal
          </td>
          <td class="caption text-xs-right">
            {{ subTotal | currency("P") }}
          </td>
        </tr>
        <tr>
          <td class="caption text-xs-right" colspan="2">
            Discount
          </td>
          <td class="caption text-xs-right">
            <span v-if="discount">{{ discount }}%</span>
          </td>
        </tr> -->
        <tr>
          <td class="caption text-xs-right" colspan="2">
            Total
          </td>
          <td class="caption text-xs-right">
            <strong>{{ total | currency('&#8369;') }}</strong>
          </td>
        </tr>
      </tbody>
    </table>

    <v-card
      v-if="
        stockOrder.status.toLowerCase() === 'shipped' ||
          stockOrder.status.toLowerCase() === 'partially shipped'
      "
    >
      <v-card-title class="subheading font-weight-medium"
        >Shipments to Receive</v-card-title
      >
      <ShipmentDetails :stockOrderId="$route.params.id" :stockOrder="stockOrder"/>
    </v-card>

    <v-dialog v-model="loaderDialog" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          {{ loaderDialogMessage }}
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmUploadDialog" persistent>
      <v-card>
        <v-card-title class="subheading font-weight-bold primary white--text"
          >CONFIRMATION</v-card-title
        >
        <v-divider />
        <v-card-text>Are you sure you want to upload this proof of payment? This is irreversible once confirmed.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn outline color="black" @click="confirmUploadDialog = false">CANCEL</v-btn>
          <v-btn color="primary" dark depressed @click="uploadProofOfPayment">UPLOAD</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-bottom-sheet full-width v-model="sheet">
      <v-list>
        <v-subheader>Add using</v-subheader>
        <v-list-tile @click="takePicture('camera')">
          <v-list-tile-avatar>
            <v-icon>camera_alt</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-title>Camera</v-list-tile-title>
        </v-list-tile>
        <v-list-tile @click="takePicture('photo_library')">
          <v-list-tile-avatar>
            <v-icon>photo_library</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-title>Gallery</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-bottom-sheet>

    <Modal ref="modal" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { mixins } from "@/mixins";
import { date } from "@/mixins/date";
import BottomNav from "@/components/BottomNav";
import BasketBadge from "@/components/BasketBadge";
import ShipmentDetails from "@/components/ShipmentDetails";
import Modal from "@/components/Modal";

export default {
  mixins: [date, mixins],
  data: () => ({
    search: null,
    loading: false,
    loaderDialog: false,

    stockOrder: {
      id: null,
      items: [],
      userId: null,
      createdAt: null,
      paymentDetails: {
        amount: '-',
        paymentStatus: '-',
        paymentType: 'COD',
        proofOfPayment: null
      },
      logisticsDetails: {
        isFreeShipping: false,
        logisticProvider: 'pick-up',
        shippingFee: 0
      },
      status: '-',
      shipmentsToReceive: 0
    },

    loaderDialogMessage: null,
    sheet: false,
    uploadLoading: false,
    
    inAppBrowser: null,
    enlargeDialog: false,
    Placeholder: require("@/assets/placeholder.png"),
    confirmUploadDialog: false

  }),
  mounted() {
    this.cordovaBackButton(this.goBack);

    this.loaderDialog = true;
    this.loaderDialogMessage = "Please wait...";
    this.$store
      .dispatch("stock_orders/FIND", this.$route.params.id)
      .then(res => {
        if (res.success) {
          console.log(res);
          console.log(this.stockOrder);
          this.stockOrder = Object.assign({}, this.stockOrder, res.data);
          this.stockOrder.id = this.$route.params.id;
          console.log(this.stockOrder);
          if (
            (!this.stockOrder.read &&
              this.stockOrder.status.toLowerCase() === "processing") ||
            (!this.stockOrder.read && this.stockOrder.status === "cancelled")
          ) {
            this.$store.dispatch("stock_orders/UPDATE_STOCK_ORDER", {
              id: this.stockOrder.id,
              key: "read",
              value: true
            });
          }
        }
      })
      .catch(error => {
        console.log(error);
      })
      .finally(() => {
        this.loaderDialogMessage = null;
        this.loaderDialog = false;
      });
  },
  methods: {
    async goBack() {
      //remove temp proof of payment if not uploaded
      if(
          this.stockOrder.paymentDetails.proofOfPayment &&
          (this.stockOrder.paymentDetails.paymentStatus === '-' &&
          this.stockOrder.paymentDetails.paymentStatus === 'denied')
      ) {
        
        this.loaderDialog = true;
        this.loaderDialogMessage = "Please wait...";
        
        await this.$store.dispatch('stock_orders/REMOVE_PROOF_OF_PAYMENT', this.stockOrder.stockOrderReference);
        this.stockOrder.paymentDetails.proofOfPayment = null;

        this.loaderDialog = false;
        this.loaderDialogMessage = null;
      }

      this.$router.push({
        name: "Orders",
        query: {
          tab: "tab2"
        }
      });
    },

    enlargeImage() {
      const url = this.stockOrder.paymentDetails.proofOfPayment;
      const target = "_blank";
      const options = `location=no,clearcache=yes,hardwareback=no,footer=yes,closebuttoncaption=CLOSE,closebuttoncolor=#ffffff,footercolor=${process.env.primaryColor}`;
      this.inAppBrowserRef = cordova.InAppBrowser.open(
        url,
        target,
        options
      );
    }, 

    async takePicture(selected) {
      try {
        this.sheet = false;

        const res = await this.$store.dispatch(
          "plugins/TAKE_PHOTO_FOR_PAYMENT",
          selected
        );

        this.loaderDialog = true;
        this.loaderDialogMessage = "Please wait...";

        const downloadURL = await this.$store.dispatch('stock_orders/TEMP_UPLOAD_PROOF_OF_PAYMENT', {
          picture: res,
          stockOrderReference: this.stockOrder.stockOrderReference
        });

        this.stockOrder.paymentDetails.proofOfPayment = downloadURL;
        
        this.loaderDialog = false;
        this.loaderDialogMessage = null;

      } catch (error) {
        this.loaderDialog = false;
        this.loaderDialogMessage = null;
        this.sheet = false;
        this.$refs.modal.show("Sorry", "An error occurred");
        console.log(error);
      }
      
    },

    async removeProofOfPayment() {
      try {
        this.uploadLoading = true;
        await this.$store.dispatch('stock_orders/REMOVE_PROOF_OF_PAYMENT', this.stockOrder.stockOrderReference);
        this.stockOrder.paymentDetails.proofOfPayment = null;
        this.uploadLoading = false;

      } catch (error) {
        this.uploadLoading = false;
        this.$refs.modal.show("Sorry", "An error occurred");
        console.log(error);
      }

      this.sheet = false;
    },

    async uploadProofOfPayment() {
      try {
        this.confirmUploadDialog = false;
        this.uploadLoading = true;

        const response = await this.$store.dispatch('stock_orders/UPLOAD_PROOF_OF_PAYMENT', {
          id: this.stockOrder.id,
          paymentDetails: this.stockOrder.paymentDetails
        }); 

        this.stockOrder.paymentDetails = Object.assign({}, response);
        
        this.uploadLoading = false;
        this.$refs.modal.show("Success!", "Your proof of payment has been uploaded!");

      } catch(error) {
        this.uploadLoading = false;
        console.log(error);
        this.$refs.modal.show("Sorry", "An error occurred while uploading your proof of payment. Please try again later.");
      }
    }

  },
  computed: {
    subTotal() {
      return this.stockOrder.items.reduce(
        (a, b) => a + b.resellerPrice * b.qty,
        0
      );
    },

    discount() {
      let discount;
      // if (this.subTotal >= 1500 && this.subTotal <= 2999) {
      // 	discount = 10;
      // } else if (this.subTotal >= 3000 && this.subTotal <= 4999) {
      // 	discount = 15;
      // } else if (this.subTotal >= 5000 && this.subTotal <= 9999) {
      // 	discount = 18;
      // } else if (this.subTotal >= 10000 && this.subTotal <= 24999) {
      // 	discount = 20;
      // } else {
      // 	discount = null;
      // }
      return discount;
    },

    total() {
      if (this.discount) {
        return this.subTotal - (this.discount / 100) * this.subTotal;
      } else {
        return this.subTotal;
      }
    },

    isScheduledForShipping() {
      return (
        (this.stockOrder.status.toLowerCase() === 'shipped' || this.stockOrder.status.toLowerCase() === 'partially shipped') &&
        this.stockOrder.shipmentsToReceive  > 0
      );
    }
  },
  filters: {
    joinAttributes(val) {
      const attributes = JSON.parse(JSON.stringify(val));
      delete attributes.qty;
      delete attributes.quantity;

      const keys = Object.keys(attributes);

      let str = "";

      keys.forEach(key => {
        str += `${key.toUpperCase()}: ${attributes[key]}\n`;
      });

      return str;
    },
    uppercase(v) {
      return v.toUpperCase();
    }
  },
  components: {
    BasketBadge,
    Modal,
    ShipmentDetails
  }
};
</script>

<style scoped>

.overlayImage {
  position: absolute;
  top: 38%;
  left: 18%;
  z-index: 1;
}

.overlayImageNoImg {
  position: absolute;
  top: 32%;
  left: 28%;
  z-index: 1;
}

.basket-table {
  overflow-x: auto;
  border-collapse: collapse;
}

.basket-table {
  width: 100%;
  border-collapse: collapse;
}

.basket-table td,
.basket-table th {
  border: 1px sold #ddd;
  padding: 8px;
}

.basket-table td.border-bottom {
  border-bottom: 1px solid #ddd;
}

.basket-table th.border-bottom {
  border-bottom: 1px solid #1976d2;
}

.header-size {
  font-size: 10px;
}

tr.border-top td {
  border-top: 1pt solid #d0d0d0;
}

.icon {
  display: inline-flex !important;
}
</style>
