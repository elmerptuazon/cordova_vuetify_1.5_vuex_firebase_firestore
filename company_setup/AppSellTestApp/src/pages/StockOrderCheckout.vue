<template>
  <div>
    <v-toolbar app color="primary" dark>
      <v-btn icon @click="goBack">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title v-if="$store.state.showToolbarTitles"
        >Stock Orders</v-toolbar-title
      >
      <v-spacer v-if="$store.state.rightAlignToolbarIcons"></v-spacer>
      <BasketBadge tabName="msa" />
      <v-spacer></v-spacer>
      <Accounts />
    </v-toolbar>

    <v-stepper v-model="stepperCounter">
      <v-stepper-header>
        <v-stepper-step :complete="stepperCounter > 1" step="1"
          >Confirm Shipping Address</v-stepper-step
        >

        <v-divider></v-divider>

        <v-stepper-step :complete="stepperCounter > 2" step="2"
          >Shipment Options</v-stepper-step
        >

        <v-divider></v-divider>

        <v-stepper-step :complete="stepperCounter > 3" step="3"
          >Payment Options</v-stepper-step
        >

        <v-divider></v-divider>
        <v-stepper-step step="4">Submit Order</v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-card flat>
            <v-card-title>
              <span class="body-2">Confirm Shipping Address</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-container>
              <v-layout align-center justify-center wrap>
                <v-flex xs12>
                  <div class="caption">The stock order will be delivered in this address:</div>
                </v-flex>

                <v-flex xs12 mt-3>
                  <div class="primary--text headline font-weight-bold">
                    {{ userAddress.house }}, {{ userAddress.streetName }}, {{ userAddress.barangay }}, {{ userAddress.citymun }},
                    {{ userAddress.province }}, {{ userAddress.zipCode }}
                  </div>
                </v-flex>

                <v-flex xs12 mt-3>
                  <div class="font-italic caption">
                    To change this shipping address, kindly go to your profile page and change your address.
                    or <b class="body-1 primary--text font-weight-bold" @click="$router.push({name: 'EditProfile'})">CLICK HERE</b> to go to Edit Profile Page.
                  </div>
                </v-flex>
              </v-layout>
            </v-container>

            <v-container>
              <v-layout align-center justify-center mt-3>
                <v-flex xs3>
                  <v-btn flat color="black" @click="goBack">
                    CANCEL
                  </v-btn>
                </v-flex>
                <v-flex xs3 offset-xs1>
                  <v-btn color="primary" depressed @click="startQuotations">
                    Continue
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-card class="mb-2" flat>
            <v-card-title>
              <span class="body-2">Select shipping option</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-container>
              <v-radio-group v-model="logisticsID">
                <v-card
                  v-for="logistics in logisticsProvider"
                  :key="logistics.id"
                  min-width="275px"
                >
                  <v-card-title>
                    <v-radio 
                      :value="logistics.id" 
                      :disabled="logistics.shippingFee === 'error'"
                    ></v-radio>
                    <span class="subheading">{{
                      logistics.id.toUpperCase()
                    }}</span>
                    <span v-if="logistics.shippingFee === 'error'" class="font-weight-bold">(CANNOT BE SELECTED)</span>
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text>
                    <v-layout>
                      <v-flex xs5>
                        <v-img
                          :src="logistics.logoURL"
                          height="125px"
                          contain
                        ></v-img>
                      </v-flex>
                      <v-flex xs7>
                        <v-card-title primary-title>
                          <div>
                            <div class="subheading">Shipping Fee:</div>
                            <div 
                              v-if="subTotal >= freeDeliveryCutOff && 
                                logistics.id !== 'pick-up'
                              " 
                              class="primary--text"
                            > FREE SHIPPING</div>
                            <div v-else-if="logistics.shippingFee === 'error'">ERROR</div>
                            <div v-else>+ {{ logistics.shippingFee | currency('P ') }} </div>
                          </div>
                        </v-card-title>
                      </v-flex>
                    </v-layout>
                  </v-card-text>
                </v-card>

                <v-layout align-center justify-end row px-6 mt-4>
                  <v-flex xs4 mr-2>
                    <v-btn color="black" flat @click="stepperCounter = 1">
                      BACK
                    </v-btn>
                  </v-flex>
                  <v-flex xs4>
                    <v-btn color="primary" depressed @click="stepperCounter = 3">
                      Continue
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-radio-group>
            </v-container>
          </v-card>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-card>
            <v-card-title>
              <span class="body-2">Breakdown of Orders</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-container>
               <table class="basket-table">
                <thead>
                  <tr>
                    <th
                      class="border-bottom header-size grey--text text--darken-1"
                    >
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
                        <v-flex xs4>
                          <v-avatar tile size="40px">
                            <v-img
                              :src="item.image"
                              :alt="item.name"
                              class="elevation-1"
                            ></v-img>
                          </v-avatar>
                        </v-flex>
                        <v-flex xs8>
                          <span v-html="item.name" class="caption"></span>
                          <br />
                          <span class="caption">
                            {{ item.attributes | joinAttributes }}
                          </span>
                        </v-flex>
                      </v-layout>
                    </td>
                    <td class="caption text-xs-right border-bottom">
                      {{ item.qty }}
                    </td>
                    <td class="caption text-xs-right border-bottom">
                      {{ (item.qty * item.resellerPrice) | currency("P") }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="3"></td>
                  </tr>
                  <tr>
                    <td class="caption text-xs-right" colspan="2">
                      Subtotal
                    </td>
                    <td class="caption text-xs-right">
                      {{ subTotal | currency("P") }}
                    </td>
                  </tr>
                  <!-- <tr>
                    <td class="caption text-xs-right" colspan="2">
                      Discount
                    </td>
                    <td class="caption text-xs-right">
                      <span v-if="discount">{{ discount }}%</span>
                    </td>
                  </tr> -->
                  <tr>
                    <td class="caption text-xs-right" colspan="2">
                      Shipping Fee
                    </td>
                    <td class="caption text-xs-right">
                      <span 
                        v-if="subTotal >= freeDeliveryCutOff" 
                        class="primary--text"
                      >FREE</span>
                      <span v-else>{{ shippingFee | currency("P") }}</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="caption text-xs-right" colspan="2">
                      Total
                    </td>
                    <td class="caption text-xs-right">
                      <strong>{{ total | currency("P") }}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </v-container>
          </v-card>
          <v-container class="mt-4 px-3">
            <v-layout align-center justify-end px-6 row>
              <v-flex xs4 mr-2>
                <v-btn flat @click="stepperCounter = 2">Back</v-btn>
              </v-flex>
              <v-flex xs4>
                <v-btn color="primary" depressed @click="stepperCounter = 4">
                  Continue
                </v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-stepper-content>

        <v-stepper-content step="4">
          <v-card class="mb-5">
            <v-card-title>
              <span class="body-2">Select Payment Option</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-container>
              <v-radio-group v-model="payment.paymentType">
                <v-radio
                  label="Cash On Delivery (COD)/Upon pick-up"
                  value="COD"
                ></v-radio>
                <v-radio
                  label="Credit Card (Visa and Mastercard Only)"
                  value="CC"
                  :disabled="totalIsInMinimumPrice"
                ></v-radio>
                <v-radio
                  label="GCash"
                  value="GCash"
                  :disabled="totalIsInMinimumPrice || totalIsInMaximumPrice"
                ></v-radio>
                <v-radio
                  label="Grab Pay"
                  value="GrabPay"
                  :disabled="totalIsInMinimumPrice || totalIsInMaximumPrice"
                ></v-radio>
                <div v-if="totalIsInMinimumPrice" class="mt-1">
                  <v-divider></v-divider>
                  <div class="mt-2 body-1 red--text font-italic font-weight-bold">
                    Online payment is only available for stock order above {{ 100 | currency("PHP ")}}
                  </div>  
                </div>
                <div v-if="totalIsInMaximumPrice" class="mt-1">
                  <v-divider></v-divider>
                  <div class="mt-2 body-1 red--text font-italic font-weight-bold">
                    E-Wallet payments are not available for stock order above {{ 100000 | currency("PHP ")}}
                  </div>  
                </div>
                <v-divider v-if="payment.paymentType === 'CC'"></v-divider>
                <creditCardForm
                  class="mt-2"
                  v-if="payment.paymentType === 'CC'"
                  @cardDetails="SetCardDetails"
                />
                <v-divider v-if="payment.paymentType === 'GCash' || payment.paymentType === 'GrabPay'"></v-divider>
                <GCashGrabPayForm
                  :paymentType="payment.paymentType"
                  class="mt-2"
                  v-if="payment.paymentType === 'GCash' || payment.paymentType === 'GrabPay'"
                  @accountDetails="SetAccountDetails"
                />
              </v-radio-group>
            </v-container>
          </v-card>
          <div class="text-xs-center mt-3 mb-3">
            <v-btn
              @click="submitStockOrder"
              depressed
              large
              color="primary"
              class="white--text"
              :disabled="stockOrder.items.length < 1"
            >
              <v-icon left>check_circle</v-icon>
              <span v-if="payment.paymentType === 'COD'">
                Submit Order
              </span>
              <span v-else>
                Pay and Submit Order
              </span>
            </v-btn>
            <v-btn flat @click="stepperCounter = 3">Back</v-btn>
          </div>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>

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

    <v-dialog
      v-model="checkOutDialog"
      persistent fullscreen
    >
      <v-card :height="checkoutHeight" :width="checkoutWidth">
        <v-card-title class="primary">
          <div v-if="payment.paymentType === 'CC'" 
            class="white--text font-weight-bold title"
            >Authorize Card Access
          </div>
          <div v-else 
            class="white--text font-weight-bold title"
            >Authorize Account Access
          </div>
          <v-spacer></v-spacer>
          <v-icon v-if="payment.paymentType === 'CC'" medium color="white" @click.native="recheckPaymentStatus">close</v-icon>
          <v-icon v-else medium color="white" @click.native="continueEWalletPayment">close</v-icon>
        </v-card-title>
        <v-container>
          <iframe 
            ref="checkOutFrame" :src="checkOutURL" 
            :height="checkoutHeight" :width="checkoutWidth" 
            frameborder="0" 
          />
        </v-container>
        <v-divider></v-divider>
        <v-card-actions class="white">
          <v-spacer></v-spacer>
          <v-btn v-if="payment.paymentType === 'CC'" color="primary" flat @click.native="recheckPaymentStatus">CLOSE</v-btn>
          <v-btn v-else color="primary" flat @click.native="continueEWalletPayment">CLOSE</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmationModal ref="finalizeOrder" @confirmClicked="finalizeOrder" />
    <Modal ref="modal" />
  </div>
</template>


<script>
import { mapState } from "vuex";
import { mixins } from "@/mixins";
import BottomNav from "@/components/BottomNav";
import BasketBadge from "@/components/BasketBadge";
import ConfirmationModal from "@/components/ConfirmationModal";
import creditCardForm from "@/components/creditCardForm";
import Modal from "@/components/Modal";
import GCashGrabPayForm from "@/components/GCashGrabPayForm";

export default {
  mixins: [mixins],
  data: () => ({
    items: [],
    search: null,
    loading: false,
    loaderDialog: false,
    stockOrder: {
      id: null,
      items: [],
      userId: null,
      createdAt: null
    },
    
    payment: {
      paymentType: "COD",
      amount: null,
      cardDetails: null,
      accountDetails: null,
    },

    userHasNoOrders: '',
    freeDeliveryCutOff: 0.00,

    logisticsID: "pick-up",
    loaderDialogMessage: null,
    inAppBrowserRef: null,
    stepperCounter: 0,

    checkOutDialog: false,
    checkOutURL: null,
    checkoutHeight: null,
    checkoutWidth: null,

    paymentIntent: {},
    paymentResult: {},
    createdSource: {},

    inAppBrowserRef: null,

  }),
  
  async mounted() {
    this.cordovaBackButton(this.goBack);
    
    this.loaderDialogMessage = 'Please Wait...';
    this.loaderDialog = true;

    this.checkoutHeight = window.innerHeight;
    this.checkoutWidth = window.innerWidth;
    
    let stockOrder;
    try {
      stockOrder = await this.$store.dispatch("stock_orders/GET"); 
    } catch(error) {
      console.log(error);
      this.loaderDialogMessage = null;
      this.loaderDialog = false;
    }
    
    if(!stockOrder.success) {
      this.loaderDialogMessage = null;
      this.loaderDialog = false;
      return;
    }

    this.stockOrder = Object.assign({}, stockOrder.data);

    let itemsToRemove = [];
    for(const item of this.stockOrder.items) {
      const variant = await this.$store.dispatch('variants/GET_VARIANT', {
        sku: item.sku,
        productId: item.productId
      });

      if(variant.isOutofStock) itemsToRemove.push(item);
      else if(item.qty > variant.availableQTY) itemsToRemove.push(items);
    }

    for(const item of itemsToRemove) {
      const index = this.stockOrder.items.findIndex(stockOrderItem => item.productId === stockOrderItem.productId);
      if(index !== -1) {
        this.stockOrder.items.splice(index, 1);
      }
    }

    try {
      const freeDelivery = await this.$store.dispatch('providers/GetFreeDeliveryCutOff');
      this.freeDeliveryCutOff = freeDelivery.cutOffPrice;
      this.loaderDialogMessage = null;
      this.loaderDialog = false;

    } catch(error) {
      console.log(error);
      this.loaderDialogMessage = null;
      this.loaderDialog = false;
    }
    
    //add event listener to exit browser dialog when the success or fail redirect URL are being loaded 
    window.addEventListener(
      'loadstart',
      ev => {
        console.log('URL is being loaded in the iframe', ev.url);
        if(ev.url === 'https://appsell.ph/paymentSuccess') {
          console.log('GCASH/Grab Pay has been successful!');
        
        } else if(ev.url === 'https://appsell.ph/paymentFail') {
          console.log('Gcash/Grab Pay had failed!');
        
        } else {
          console.log('URL being loaded: ', ev);
        }
      },
      false
    );

    //an event listener for successful 3ds auth
    window.addEventListener(
      'message', 
      ev => {
        console.log('message was received from the iframe!', ev);
        this.recheckPaymentStatus();    
      },
      false
    );

  },
  beforeDestroy() {
    if(this.inAppBrowserRef) {
      this.inAppBrowserRef.removeEventListener('exit', ev => {console.log('exit event listener removed!')}, false);
      this.inAppBrowserRef.removeEventListener('loadstart', ev => {console.log('loadstart event listener removed!')}, false);
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },

    closeInAppBrowser() {
      this.inAppBrowserRef.close();
    },

    submitStockOrder() {
      this.$refs.finalizeOrder.show(
        "Confirm",
        "Are you sure you want to submit these orders to " +
          this.$store.getters["GET_COMPANY"] +
          "?"
      );
    },
    
    async startQuotations() {
      this.loaderDialog = true;
      this.loaderDialogMessage = "Please wait";

      try {
        const user = this.$store.getters["accounts/user"];
        await this.$store.dispatch("providers/CalculateShipping", {
          itemWeight: this.totalWeight,
          toAddress: user.address
        });

        this.loaderDialogMessage = null;
        this.loaderDialog = false;
        console.log('logistics provider:', this.logisticsProvider);
        this.stepperCounter = 2;
      
      } catch(error) {
        console.log(error);
        this.loaderDialogMessage = null;
        this.loaderDialog = false;
        this.stepperCounter = 2;

        let msg;
        
        if(error.logisticsID === 'barapido') {
          //print corresponding error messages of barapido api error
          if(error.response.data === 'Error: itemWeight exceeds the weight limit.') {
            msg = 'Weight of the Stock Order exceeds the weight delivery requirement';
        
          } else if(error.response.data === "Error: TypeError: Cannot read property '0' of undefined") {
            msg = 'Weight of the Stock Order is invalid.'

          } else {
            msg = 'An error occured. Please try again...';
          }
        }

        this.$refs.modal.show(
          `${error.logisticsID} Delivery Quotation Error`,
          msg
        );
      }

    },

    validateCardDetails() {
      //validate card details
      if (
        !this.$cardFormat.validateCardNumber(
          this.payment.cardDetails.cardNumber
        )
      ) {
        this.loaderDialog = false;
        this.loaderDialogMessage = null;
        this.$refs.finalizeOrder.close();

        this.$refs.modal.show(
          "Card Details Error!",
          "Please check your card number."
        );
        return false;
      }
      // validate card expiry
      if (
        !this.$cardFormat.validateCardExpiry(
          this.payment.cardDetails.expiry
        )
      ) {
        this.loaderDialog = false;
        this.loaderDialogMessage = null;
        this.$refs.finalizeOrder.close();

        this.$refs.modal.show(
          "Card Details Error!",
          "Please check your card expiry."
        );
        return false;
      }
      // validate card CVC
      if (!this.$cardFormat.validateCardCVC(this.payment.cardDetails.CVC)) {
        this.loaderDialog = false;
        this.loaderDialogMessage = null;
        this.$refs.finalizeOrder.close();

        this.$refs.modal.show(
          "Card Details Error!",
          "Please check your card CVC."
        );
        return false;
      }

      return true;
    },

    validateAccountDetails() {
      if(!this.payment.accountDetails.name) {
        this.loaderDialog = false;
        this.loaderDialogMessage = null;
        this.$refs.finalizeOrder.close();

        this.$refs.modal.show(
          "Account Details Error!",
          "Please enter a valid fullname."
        );

        return false;
      }
      if(!this.payment.accountDetails.email) {
        this.loaderDialog = false;
        this.loaderDialogMessage = null;
        this.$refs.finalizeOrder.close();

        this.$refs.modal.show(
          "Account Details Error!",
          "Please enter a valid email."
        );

        return false;
      }
      if(!this.payment.accountDetails.phone) {
        this.loaderDialog = false;
        this.loaderDialogMessage = null;
        this.$refs.finalizeOrder.close();

        this.$refs.modal.show(
          "Account Details Error!",
          "Please enter a valid phone number."
        );

        return false;
      }

      return true;
    },
    
    async finalizeOrder() {
      this.loaderDialog = true;
      this.loaderDialogMessage = "Submitting orders...";
      let user = this.$store.getters["accounts/user"];

      try {
        let paymentResult = null;

        this.payment.amount = this.total;
        this.stockOrder.logisticsDetails = {
          logisticProvider: this.logisticsID,
          shippingFee: this.shippingFee
        };

        //this a flag that tells the dashboard that this is a new order and hasnt been read by the brand company.
        this.stockOrder.isRead = false;
        
        //determine if this shipping is free
        this.stockOrder.logisticsDetails.isFreeShipping = this.subTotal >= this.freeDeliveryCutOff;

        //check kung CC or COD
        switch(this.payment.paymentType) {
          
          case "CC": {
            this.$refs.finalizeOrder.close();
            this.loaderDialogMessage = "Validating card details...";
            
            const isCardValid = await this.validateCardDetails();
            if(!isCardValid) return;

            let userDetails = {
              name: `${user.lastName}, ${user.firstName} ${user.middleInitial}`,
              email: user.email,
              phone: user.contact,
              address: user.address
            };

            //process payment
            this.loaderDialogMessage = "Processing card details...";
            paymentResult = await this.$store.dispatch(
              "payment/PayOrderThruCreditCard",
              {
                payment: this.payment,
                userDetails: userDetails,
                stockOrder: this.stockOrder
              }
            );

            console.log(paymentResult);
            //if the card requires 3ds auth, show checkout_url to user
            if(paymentResult.paymentStatus === 'awaiting_next_action') {
              this.loaderDialogMessage = "Creating checkout link...";
              
              this.paymentIntent = {
                id: paymentResult.transactionNumber,
                client_key: paymentResult.client_key
              };

              this.paymentResult = Object.assign({}, paymentResult);

              //open the webview for the URL returned
              const url = paymentResult.checkout_url;
              const target = "_blank";
              const options = `location=no,clearcache=yes,hardwareback=no,footer=yes,closebuttoncaption=DONE,closebuttoncolor=#ffffff,footercolor=${process.env.primaryColor}`;
              this.inAppBrowserRef = cordova.InAppBrowser.open(
                url,
                target,
                options
              );
              this.inAppBrowserRef.addEventListener('exit', this.recheckPaymentStatus);
              this.inAppBrowserRef.addEventListener('loadstart', ev => {
                if(ev.url === 'https://appsell.ph/paymentSuccess') {
                  this.closeInAppBrowser();
                }
              });

            } else if (paymentResult.paymentStatus === 'succeeded') {
              this.submitOrder(paymentResult);
            }
            
            break;
          }

          case "GCash": case "GrabPay": {
            this.$refs.finalizeOrder.close();
          
            const isAccountValid = await this.validateAccountDetails();
            if(!isAccountValid) return;

            this.processEWalletPay();

            break;
          } 

          case "COD": {
            this.$refs.finalizeOrder.close();
            paymentResult = await this.$store.dispatch(
              "payment/ProcessCODOrder",
              {
                payment: this.payment
              }
            );

            this.stockOrder.paymentDetails = paymentResult;

            console.log(this.stockOrder);
            //this flow will always result to success, any error should be thrown
            //and handled in the catch statement

            await this.submitOrder(paymentResult);

            break;
          }

          default: {
            this.$refs.modal.show(
              "Payment method error!",
              "Please select a payment method."
            );
          }
        }

      } catch (error) {
        //add catch for incorrect payment/credit cards.
        console.log(error);
        this.loaderDialog = false;
        this.loaderDialogMessage = null;
        this.$refs.finalizeOrder.close();

        let errorMessage, errorHeader;

        if(error.errors[0].code === "parameter_below_minimum") {
          switch(error.errors[0].code) {
            case "parameter_below_minimum": {
              errorHeader = "Invalid Order Amount!";
              errorMessage = "Your total stock order payment should be no less than PHP 100. Please try again later.";
              break;
            }

            default: {
              console.log('other error code: ', error.errors[0]);
              break;
            }
          }
        
        } else {
          switch (error.errors[0].sub_code) {
            case "generic_decline": {
              errorHeader = "Card Declined!";
              errorMessage = "Your card has been declined, please contact your service provider.";
              break;
            }
            
            case "card_expired": {
              errorHeader = "Card Expired!";
              errorMessage = "Your card has expired, please contact your service provider.";
              break;
            } 

            case "cvn_invalid": {
              errorHeader = "Wrong CVC!";
              errorMessage = "Wrong CVC, please re-enter your correct CVC.";
              break;
            } 

            case "processor_unavailable": {
              errorHeader = "Unavailable Processor!"
              errorMessage = "Failed to process your card due to unavailable payment processor, please try again later.";
              break;
            } 

            case "insufficient_funds": {
              errorHeader = "Insufficient Funds!"
              errorMessage = "Your card has insufficient funds, please contact your service provider.";
              break;
            }
              
            default: {
              errorHeader = "Card Declined!"
              errorMessage = "Your card has been declined, please contact your service provider."
              break;
            }

          }
        }

        this.$refs.modal.show(errorHeader, errorMessage);
      }
    },

    async recheckPaymentStatus() {
      try {
        this.checkOutDialog = false;

        console.log('rechecking payment intent status...');
        this.loaderDialogMessage = "Rechecking payment status...";

        const response = await this.$store.dispatch('payment/checkPaymentStatus', {
          id: this.paymentIntent.id,
          client_key: this.paymentIntent.client_key
        });

        console.log('recheckPaymentStatus finished: ', response);

        if(response.attributes.status === 'succeeded') {
          this.loaderDialog = false;
          this.loaderDialogMessage = null;
          this.$refs.finalizeOrder.close();

          this.$refs.modal.show(
            "Payment Success!",
            "Payment was recorded!"
          );

          this.submitOrder(this.paymentResult);
        
        } else if(response.attributes.status === 'awaiting_next_action') {
          this.loaderDialog = false;
          this.loaderDialogMessage = null;
          this.$refs.finalizeOrder.close();
          
          this.$refs.modal.show(
            "Payment Cancelled!",
            "Please authenticate this payment transaction."
          );

        } else if(response.attributes.status === 'awaiting_payment_method') {
          this.loaderDialog = false;
          this.loaderDialogMessage = null;
          this.$refs.finalizeOrder.close();

          console.log(response.attributes.last_payment_error)
          
          this.$refs.modal.show(
            "Payment Error!",
            "Payment was not recorded!"
          );
        }

        window.removeEventListener('message', ev=> {console.log('message event is removed.')}, false);
      
      } catch(error) {
        console.log(error);
        
        this.loaderDialog = false;
        this.loaderDialogMessage = null;
        this.$refs.finalizeOrder.close();

        this.$refs.modal.show(
          "Error in Recheck Payment",
          "Please try again later."
        );

        window.removeEventListener('message', ev=> {console.log('message event is removed.')}, false);
      }
      
    },

    async submitOrder(paymentResult) {
      if(this.payment.paymentType === 'CC') {
        this.stockOrder.paymentDetails = {
          amount: (paymentResult.amount).toFixed(2),
          paymentStatus: "Paid",
          paymentType: "CC",
          transactionNumber: paymentResult.transactionNumber,
          paymentGateway: "Paymongo"
        };
      
      } else if(this.payment.paymentType === 'GCash' || this.payment.paymentType === 'GrabPay') {
        this.stockOrder.paymentDetails = {
          amount: (paymentResult.amount).toFixed(2),
          paymentStatus: "Paid",
          paymentType: this.payment.paymentType,
          transactionNumber: paymentResult.transactionNumber,
          paymentGateway: "Paymongo"
        };

      } else if(this.payment.paymentType === 'COD') {
        this.stockOrder.paymentDetails = Object.assign({}, paymentResult);
      }

      console.log(this.stockOrder);
      this.loaderDialogMessage = 'Submitting your order to the company...';

      let result = await this.$store.dispatch(
        "stock_orders/SUBMIT",
        this.stockOrder
      );
      
      this.loaderDialog = false;
      this.loaderDialogMessage = null;

      this.$router.push({
        name: "StockOrderCheckoutSuccess",
        params: {
          stockOrder: this.stockOrder,
          submittedAt: result.submittedAt
        }
      });
    },

    async processEWalletPay() {
      this.loaderDialogMessage = `Processing ${this.payment.paymentType} account details...`
      const { name, email, phone } = this.payment.accountDetails;

      let userDetails = {
        name, 
        email,
        phone,
        address: this.userAddress
      };
      
      this.loaderDialogMessage = `Creating payment source...`;

      try {
        this.createdSource = await this.$store.dispatch(
          "payment/CreateEWalletSource",
          {
            payment: this.payment,
            userDetails: userDetails,
            stockOrder: this.stockOrder
          }
        );

        const url = this.createdSource.attributes.redirect.checkout_url;
        if(url) {
          //open the webview for the URL returned
          const url = this.createdSource.attributes.redirect.checkout_url;
          const target = "_blank";
          const options = `location=no,clearcache=yes,hardwareback=no,footer=yes,closebuttoncaption=DONE,closebuttoncolor=#ffffff,footercolor=${process.env.primaryColor}`;
          this.inAppBrowserRef = cordova.InAppBrowser.open(
            url,
            target,
            options
          );

          this.inAppBrowserRef.addEventListener('exit', this.continueEWalletPayment);
          this.inAppBrowserRef.addEventListener('loadstart', ev => {
            if(ev.url === 'https://appsell.ph/paymentSuccess') {
              this.closeInAppBrowser();
            }
          });
        }

        this.loaderDialogMessage = `Waiting for your payment authorization...`;
        // this.$store.dispatch('payment/ListenToPaymentStatus', {
        //   stockOrderId: this.stockOrder.id,
        //   source_id: this.createdSource.id
        // });
      
      } catch(error) {
        this.loaderDialog = false;
        this.loaderDialogMessage = null;

        console.log(error);
        const errorObj = error.response.data;
        let errorHeader, errorMessage;

        if(errorObj.errors[0].code === 'parameter_below_minimum') {
          errorHeader = "Invalid Order Amount!";
          errorMessage = "Your total stock order price should not be less than PHP 100. Please try again later.";
        
        } else {
          errorHeader = "Payment Failed!";
          errorMessage = "An error occured while processing your payment. Please try again later";
        }

        this.$refs.modal.show(errorHeader, errorMessage);
      }
      
    },

    async continueEWalletPayment() {
      this.checkOutURL = null;
      this.checkOutDialog = false;
      this.loaderDialogMessage = `Accepting your ${this.payment.paymentType} payment...`;

      const { name, email, phone } = this.payment.accountDetails;
      let userDetails = {
        name, 
        email,
        phone,
        address: this.userAddress
      };

      this.stockOrder.source_id = this.createdSource.id;

      try {
        const paymentResult = await this.$store.dispatch('payment/PayOrderThruEWallet', {
          payment: this.payment,
          userDetails: userDetails,
          stockOrder: this.stockOrder
        });

        if(paymentResult.status === 'paid') {
          this.loaderDialog = false;
          this.loaderDialogMessage = null;

          // delete paymentResult.accountDetails;
          // delete paymentResult.cardDetails;
          
          this.loaderDialog = false;
          this.loaderDialogMessage = null;

          this.$refs.modal.show(
            "Payment Success!",
            "Payment was successfully received by the company!"
          );

          console.log('e-wallet payment success! ', paymentResult);

          this.submitOrder(paymentResult);
        
        } else {
          this.loaderDialog = false;
          this.loaderDialogMessage = null;
          this.$refs.modal.show(
            "Payment not Successful!",
            "You denied the payment. Please try again."
          );

          console.log('e-wallet payment error! ', paymentResult);
        }
      
      } catch(error) {
        const errorResponse = error.response.data.errors[0]
        console.log('e-wallet payment error!', );
        this.loaderDialog = false;
        this.loaderDialogMessage = null;

        if(errorResponse.code === 'resource_not_chargeable_state') {
          this.$refs.modal.show(
            "Payment Authorization Denied!",
            "Payment was not successful due to denial of payment authorization. Please try again."
          );
        
        } else {
          this.$refs.modal.show(
            "Payment not Successful!",
            "Payment was not successful. Please try again later."
          );
        }
      }
      
    },

    SetCardDetails(card) {
      this.payment.cardDetails = card;
    },

    SetAccountDetails(account) {
      this.payment.accountDetails = account;
    },
  },
  computed: {
    subTotal() {
      return this.stockOrder.items.reduce(
        (a, b) => a + b.resellerPrice * b.qty,
        0
      );
    },
    totalWeight() {
      const weight = this.stockOrder.items.reduce(
        (totalWeight, currentItem) =>
          totalWeight + currentItem.weight * currentItem.qty,
        0
      );

      return weight > 0 ? weight : 1000;
    },
    discount() {
      let discount;
      // if (this.subTotal >= 1500 && this.subTotal <= 2999) {
      //   discount = 10;
      // } else if (this.subTotal >= 3000 && this.subTotal <= 4999) {
      //   discount = 15;
      // } else if (this.subTotal >= 5000 && this.subTotal <= 9999) {
      //   discount = 18;
      // } else if (this.subTotal >= 10000 && this.subTotal <= 24999) {
      //   discount = 20;
      // } else {
      //   discount = null;
      // }
      return discount;
    },

    total() {
      const isFreeDelivery = this.subTotal >= this.freeDeliveryCutOff;

      if(this.discount && isFreeDelivery) { 
        //dont include delivery free if stock order amount exceeds the freeDeliveryCutOff price quota
        return (
          this.subTotal -
          (this.discount / 100) * this.subTotal
        );

      } else if(isFreeDelivery) {
        return this.subTotal;

      } else if (this.discount) {
        return (
          this.subTotal -
          (this.discount / 100) * this.subTotal +
          this.shippingFee
        );
      } else {
        return this.subTotal + this.shippingFee;
      }
    },
    shippingFee() {
      const logisticsData = this.logisticsProvider.find(
        logistics => logistics.id === this.logisticsID
      );

      return logisticsData.shippingFee;
    },

    totalIsInMinimumPrice() {
      return this.total < 100 ? true : false; 
    },

    totalIsInMaximumPrice() {
      return this.total > 100000 ? true : false;
    },

    userAddress() {
      const user = this.$store.getters["accounts/user"];
      return user.address;
    },
    ...mapState("payment", {
      paymentOccured: state => state.paymentOccured
    }),
    ...mapState("providers", {
      paymentProvider: state => state.paymentProvider,
      logisticsProvider: state => state.logisticsProvider
    })
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
    }
  },
  components: {
    BasketBadge,
    ConfirmationModal,
    creditCardForm,
    Modal,
    GCashGrabPayForm
  },

  watch: {
    paymentOccured: function(val) {
      console.log(`payment ${val}`);
      if (val) {
        this.inAppBrowserRef.close();
      } else {
        this.inAppBrowserRef.close();
        this.$refs.finalizeOrder.close();
        this.loaderDialog = false;
        this.loaderDialogMessage = null;
        this.$refs.modal.show(
          "Transaction Failed",
          "Charging your card unsuccessful, please try again."
        );
        this.$store.commit("payment/SetPaymentOccured", null);
      }
    }

    //   paymentOccured(newValue, oldValue) {
    //     console.log(`payment from ${oldValue} to ${newValue}`);
    //     if (val) {
    //       this.inAppBrowserRef.close();
    //     }
    //   }
  }
};
</script>

<style scoped>
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
