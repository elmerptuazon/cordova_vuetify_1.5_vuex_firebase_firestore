<template>
  <div>
    <v-toolbar app color="primary" dark>
      <v-btn icon @click="goBack">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title v-if="$store.state.showToolbarTitles">{{
        GET_CURRENT_CATALOGUE
      }}</v-toolbar-title>
      <BasketBadge tabName="categories" />
      <v-btn icon @click="shareProduct">
        <v-icon>share</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <ContactsBadge/>
      <Accounts />
    </v-toolbar>

    <div class="text-xs-center mt-5" v-if="!product.id">
      <v-progress-circular
        :size="100"
        :width="5"
        color="primary"
        indeterminate
      ></v-progress-circular>
    </div>

    <div v-else>
      <v-container fluid class="grey--text text--darken-2" grid-list-md>
        <div class="mb-2">
          <v-container>
            <div
              style="width: 200px; max-width: 200px; margin: 0 auto;"
              v-if="!product.photos"
            >
              <v-img :src="product.downloadURL" height="200" contain>
                <v-layout
                  slot="placeholder"
                  fill-height
                  align-center
                  justify-center
                  ma-0
                >
                  <v-progress-circular
                    indeterminate
                    color="grey lighten-5"
                  ></v-progress-circular>
                </v-layout>
              </v-img>
            </div>
            <!-- <v-carousel v-else>
						<v-carousel-item
						v-for="(src, i) in product.photos"
						:key="i"
						:src="src"
						></v-carousel-item>
					</v-carousel> -->

            <carousel
              v-else
              :perPage="1"
              :autoplay="true"
              :autoplayTimeout="5000"
              :loop="true"
              :paginationEnabled="false"
              :navigationEnabled="true"
            >
              <slide v-for="(source, i) in product.photos" :key="i">
                <!-- <v-img :src="source" width="100"></v-img> -->
                <img :src="source" :alt="source" />
              </slide>
            </carousel>
          </v-container>
        </div>

        <img
          id="hidden-thumbnail"
          :src="product.downloadURL"
          v-show="hideProductThumbnail"
        />
        <canvas id="thumbnail-canvass" v-show="hideProductThumbnail" />

        <p class="grey--text text--darken-2 product-price pb-0 mb-2">
          SRP: {{ product.price | currency("&#8369;") }}
          <span v-show="user.type === 'Reseller'"
            >&nbsp;&nbsp; Distr. Price:
            {{
              product.resellerPrice || product.price | currency("&#8369;")
            }}</span
          >
          <!-- SRP: {{ product.price | currency("&#8369;") }} -->
        </p>
        <p class="product-name pt-0 mb-2">{{ product.name }}</p>
        
        <div v-if="product.description">
          <p class="product-description" v-if="showMoreDescription">
            {{ product.description }}
            <a @click="showMoreDescription = false">Show less</a> or
            <a @click="copyText" class="pink--text">Copy text</a>
          </p>
          <p class="product-description" v-else>
            {{ product.description | trunc }}
            <a @click="showMoreDescription = true">Show more</a>
          </p>
        </div>

        <v-btn
          v-if="user.type === 'Reseller'"
          @click="openItemDialog('Stock Order')"
          round 
          depressed
          color="primary"
          dark
          block
          >Order from {{ $store.getters["GET_COMPANY"] }}
        </v-btn>
        <div class="my-2"></div>
        <v-btn
          v-if="user.type === 'Reseller'"
          @click="openItemDialog('Customer')"
          round
          depressed
          color="primary darken-2"
          dark
          block
          >Record a Customer Order
        </v-btn>
        <v-btn
          v-else
          round
          block
          depressed
          color="primary" dark
          @click="openItemDialog('Customer')"
        >
          Add to my cart
        </v-btn>
        <!-- <div class="my-2"></div>
					<v-btn @click="openItemDialog('Inventory')" round depressed color="pink accent-1 white--text" block>Add to Personal Inventory </v-btn> -->
      </v-container>
    </div>

    <v-dialog v-model="basketConfirmationDialog" width="250">
      <v-card>
        <v-card-text>
          <div class="headline text-xs-center blue--text text--darken-2">
            {{ basketConfirmationDialogText }}
          </div>
          <checkmark />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar
      :timeout="3000"
      menu-props="bottom"
      multi-line
      v-model="snackbar"
    >
      {{ snackbarMessage }}
      <v-btn flat color="blue darken-2" @click.native="snackbar = false"
        >Close</v-btn
      >
    </v-snackbar>

    <BottomNav currentTab="categories" />

    <v-dialog
      v-model="addBasketToContactDialog"
      fullscreen
      transition="dialog-bottom-transition"
      :overlay="false"
    >
      <v-card>
        <ContactSelection
          @CLOSEDIALOG="addBasketToContactDialog = false"
          @SELECTEDCONTACT="addToOfflineContactBasket"
        />
      </v-card>
    </v-dialog>

    <v-bottom-sheet v-model="socialSheet">
      <v-card>
        <v-card-title>
          <div class="title">Share via</div>
        </v-card-title>
        <v-card-text>
          <SocialShare @share="share" />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <v-dialog v-model="noticeDialog" max-width="290" persistent>
      <v-card>
        <v-card-title class="headline">Notice</v-card-title>
        <v-card-text>
          Facebook and Instagram no longer permits prefilling a message. We've
          already added the message to the clipboard for you. Just paste the
          content.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="pink"
            flat="flat"
            @click.native="shareProduct(currentSocial)"
            >Okay</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editItemDialog" persistent>
      <v-card>
        <v-card-title class="pa-0">
          <v-btn icon @click="cancelEdit" class="primary--text">
            <v-icon>arrow_back</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-container fluid>
            <v-form v-model="valid" ref="form" lazy-validation>
              <v-layout row wrap align-center justify-start v-if="user.type === 'Reseller'"> 
                <v-flex xs12 mt-2 v-if="!variant.hasOwnProperty('name') || attribLoading || !variant ">
                  <div v-if="attribLoading">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  </div>
                  <div v-else-if="!product.attributes.length" class="font-italic caption pl-2">no variant details...</div>
                  <div v-else class="font-italic caption pl-2">Please select a variant...</div>
                </v-flex>
                
                <div v-else class="mt-2 pl-2">
                  <v-flex xs12>
                    <div :class="[ Number(variant.availableQTY) <= Number(variant.reOrderLevel) ? 'red--text' : '']">
                      Available Stock: 
                      <span class="font-weight-bold" v-if="variant.availableQTY"> {{ variant.availableQTY }} pcs.</span>
                      <span class="font-weight-bold" v-else>OUT OF STOCK</span>
                    </div>
                  </v-flex>
                  <v-flex xs12 mt-1>
                    <div>
                      Price: 
                      <span class="font-weight-bold" v-if="variant.price"> {{ variant.price | currency("&#8369;") }}</span>
                      <span class="font-weight-bold" v-else>N/A</span>
                    </div>
                  </v-flex>
                  <v-flex xs12 mt-1>
                    <div>
                      Minimum Order: 
                      <span class="font-weight-bold" v-if="variant.minimumOrder"> {{ variant.minimumOrder }} pcs.</span>
                      <span class="font-weight-bold" v-else>N/A</span>
                    </div>
                  </v-flex>
                  <v-flex xs12 mt-1>
                    <div>
                      Maximum Order: 
                      <span class="font-weight-bold" v-if="variant.maximumOrder"> {{ variant.maximumOrder }} pcs.</span>
                      <span class="font-weight-bold" v-else>N/A</span>
                    </div>
                  </v-flex>
                </div>
              </v-layout>

              <v-layout row wrap v-if="product.attributes.length" my-3>
                <v-flex
                  xs12
                  v-for="(a, index) in product.attributes"
                  :key="index"
                >
                  <v-select
                    v-model="attribute[a.name.toLowerCase()]"
                    :items="a.items"
                    :label="a.name"
                    item-text="name"
                    item-value="name"
                    :rules="basicRules"
                    @change="fetchVariant"
                    single-line required
                    menu-props="bottom"
                  ></v-select>
                </v-flex>
              </v-layout>

              <v-layout row wrap align-center justify-start mt-3 px-1> 
                <v-flex xs8>
                  <v-text-field
                    :rules="numberRules"
                    v-model.number="attribute.quantity"
                    label="Quantity"
                    type="number"
                  ></v-text-field>
                </v-flex>

                <v-flex xs2 pa-2>
                  <v-btn 
                    v-if="user.type === 'Reseller'"
                    color="primary" icon 
                    :disabled="attribute.quantity <= 0 || Number(attribute.quantity) <= Number(variant.minimumOrder)"
                    @click="attribute.quantity = (Number(attribute.quantity) - 1) || 0"
                  >
                    <v-icon>remove</v-icon>
                  </v-btn>
                  <v-btn 
                    v-else 
                    color="primary" icon 
                    :disabled="attribute.quantity <= 0"
                    @click="attribute.quantity = (Number(attribute.quantity) - 1) || 0"
                  >
                    <v-icon>remove</v-icon>
                  </v-btn>
                </v-flex>

                <v-flex xs2 pa-2>
                  <v-btn color="primary" icon v-if="user.type === 'Reseller'"
                    @click="attribute.quantity = (Number(attribute.quantity) + 1) || 0"
                    :disabled="
                      (attribute.quantity >= Number(variant.availableQTY)) ||
                      (attribute.quantity >= Number(variant.maximumOrder))
                    "
                  >
                    <v-icon>add</v-icon>
                  </v-btn>

                  <v-btn color="primary" icon v-else
                    @click="attribute.quantity = (Number(attribute.quantity) + 1) || 0"
                  >
                    <v-icon>add</v-icon>
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-form>

            <div>
              <div v-if="selectedButton === 'Customer'">
                <v-btn
                  v-if="user.type === 'Customer'"
                  block
                  depressed
                  color="primary"
                  class="white--text"
                  @click="addToBasket"
                >
                  <v-icon left>add_shopping_cart</v-icon> Add to Cart
                </v-btn>
                <v-btn
                  v-else
                  block
                  depressed
                  color="primary"
                  class="white--text"
                  @click="showBasketDialog"
                >
                  <v-icon left>add</v-icon> Add to Customer Cart
                </v-btn>
              </div>
              
              <div v-else-if="selectedButton === 'Stock Order'">
                <v-btn
                  depressed
                  class="primary white--text"
                  block
                  @click="addToStockOrder"
                  :disabled="disableAddToCart"
                  :loading="addToStockOrderLoading"
                >
                  <v-icon left>add</v-icon> Add to my Cart
                </v-btn>
              </div>
            </div>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <Modal ref="modal" />
    <ConfirmationModal
      ref="ConfirmationModal"
      @confirmClicked="goToInventory"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { mixins } from "@/mixins";
import { Spinner } from "mint-ui";
import BottomNav from "@/components/BottomNav";
// import truncate from 'vue-truncate-collapsed';
import CheckMark from "@/components/CheckMark";
import ContactSelection from "@/components/ContactSelection";
import BasketBadge from "@/components/BasketBadge";
import SocialShare from "@/components/SocialShare";
import Modal from "@/components/Modal";
import ContactsBadge from "@/components/ContactsBadge";
const loading = require("../../static/img/spinner.gif");
const placeholder = require("../../static/img/item-placeholder.png");
import { AUTH } from "@/config/firebaseInit";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Carousel, Slide } from "vue-carousel";

export default {
  mixins: [mixins],
  data: () => ({
    isLoading: false,
    message: null,
    product: {
      attributes: [],
    },
    basketConfirmationDialog: false,
    hideProductThumbnail: false,
    snackbar: false,
    snackbarMessage: null,
    attribute: {
      quantity: 0,
    },
    attribLoading: false,
    addBasketToContactDialog: false,
    basketConfirmationDialogText: "Item Added to cart!",
    basicRules: [v => !!v || "Required"],
    valid: true,
    socialSheet: false,
    noticeDialog: false,
    currentSocial: null,
    editItemDialog: false,
    selectedButton: null,
    showMoreDescription: false,
    addToInventoryLoading: false,
    addToStockOrderLoading: false,
    selectedInventoryItem: {},
    orderQTY: null,
    variant: {},
  }),

  async mounted() {
    this.product = this.$route.params.product || {};

    this.product = await this.$store.dispatch(
      "products/GET_PRODUCT",
      this.$route.params.id
    );

    if (this.product.attributes.length) {
      const index = this.product.attributes.findIndex(attrib => attrib.name.toLowerCase() === 'quantity');
      if(index != -1) this.product.attributes.splice(index, 1);
      
      this.product.attributes.forEach(attrib => {
        this.attribute[attrib.name.toLowerCase()] = null;
      });
    
    } else if(this.user.type === 'Reseller') {
      //retreive the single variant of the current product being viewed
      const variant = await this.$store.dispatch('variants/GET_VARIANT', {
        sku: this.product.code,
        productId: this.product.id
      });
      this.variant = Object.assign({}, variant);
      this.attribute['quantity'] = this.variant.minimumOrder;
      
      console.log("product's single variant: ", this.variant);
    }

    this.cordovaBackButton(this.goBack);
  },

  methods: {
    goBack() {
      this.$router.go(-1);
    },

    quantityCounter(operation) {
      this.orderQTY = Number(this.orderQTY);
      if(operation === '+') {
        this.orderQTY += 1;
        this.attribute["quantity"] = this.orderQTY;
      }
      else if(operation === '-') {
        this.orderQTY -= 1;
        this.attribute["quantity"] = this.orderQTY;
      }
      else this.attribute["quantity"] = this.orderQTY;
    },

    openBasketConfirmationDialog(text = "Item Added to cart!") {
      this.basketConfirmationDialog = true;
      this.basketConfirmationDialogText = text;
      this.attribute = {
        qty: 0,
        color: null
      };
      this.editItemDialog = false;
    },

    openItemDialog(selected) {
      if (this.user.type === "Customer" && !this.user.resellerId) {
        this.$refs.modal.show(
          "Sorry",
          "Please choose a reseller in order to be able to place an order."
        );
        return;
      }
      if (
        this.user.type === "Reseller" &&
        JSON.parse(
          localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`)
        ).length === 0 &&
        selected === "Customer"
      ) {
        this.$refs.modal.show(
          "Sorry",
          "It seems that you do not have a customer yet, you may create one in your Organizer."
        );
        return;
      }
      this.selectedButton = selected;
      this.editItemDialog = true;
    },

    addToBasket() {
      if (!this.$refs.form.validate()) {
        return;
      }

      const product = Object.assign({}, this.product);

      if (this.attribute["quantity"]) {
        this.attribute["qty"] = Number(this.attribute["quantity"]);
        delete this.attribute["quantity"];
      }

      const item = {
        product,
        attribute: this.attribute
      };

      this.$store.dispatch("basket/ADD_ITEM", item).then(() => {
        this.openBasketConfirmationDialog();
      });
      this.orderQTY = 0;
    },

    showBasketDialog() {
      if (!this.$refs.form.validate()) {
        return false;
      }

      this.addBasketToContactDialog = true;
    },

    addToOfflineContactBasket(data) {
      if (!this.$refs.form.validate()) {
        return false;
      }

      const product = Object.assign({}, this.product);

      if (this.attribute["quantity"]) {
        this.attribute["qty"] = Number(this.attribute["quantity"]);
        delete this.attribute["quantity"];
      }

      const item = {
        product,
        attribute: this.attribute
      };

      if (data == "self") {
        this.$store.dispatch("basket/ADD_ITEM", item).then(() => {
          this.addBasketToContactDialog = false;
          this.openBasketConfirmationDialog("Item added to your cart!");
        });
        return;
      }

      console.log(data);
      if (data.hasOwnProperty("basket")) {
        const itemAttributesCopy = JSON.parse(JSON.stringify(item.attribute));
        delete itemAttributesCopy.qty;
        delete itemAttributesCopy.quantity;
        const attributes = Object.values(itemAttributesCopy).sort();
        item.unique = item.product.id + "_" + attributes.join("-");
        console.log(item.unique);

        const itemIndex = data.basket.items.findIndex(
          i => i.unique === item.unique
        );

        if (itemIndex !== -1) {
          data.basket.items[itemIndex].attribute.qty += +Number(item.attribute.qty);
        } else {
          data.basket.items.push(item);
        }

        const offlineContacts = JSON.parse(
          localStorage.getItem(`${AUTH.currentUser.uid}_offline_contacts`)
        );
        const i = offlineContacts.findIndex(user => user.id === data.id);
        //console.log(data.id);
        if (i >= 0) {
          offlineContacts[i] = data;
        }
        localStorage.setItem(
          `${AUTH.currentUser.uid}_offline_contacts`,
          JSON.stringify(offlineContacts)
        );
        this.addBasketToContactDialog = false;
        const text = `Item added to ${offlineContacts[i].firstName} ${offlineContacts[i].lastName}'s Shopping Cart!`;
        this.openBasketConfirmationDialog(text);
        this.orderQTY = null;
      }
    },
    share(app) {
      if (app === "facebook" || app === "instagram") {
        this.noticeDialog = true;
        this.currentSocial = app;
      } else {
        this.shareProduct(app);
      }
    },
    copyText() {
      // const message = `${this.product.name}\n${this.product.price}\n\n${this.product.description}\nhttp://appsell.com/product?id=${this.product.id}`;
      const message = `${this.product.name}\n${this.product.price}\n\n${this.product.description}`;
      cordova.plugins.clipboard.copy(message);
      this.snackbarMessage = "Content copied to clipboard";
      this.snackbar = true;
    },
    shareProduct() {
      // this.noticeDialog = false;

      // const message = `${this.product.name}\n${this.product.price}\n\n${this.product.description}\nhttp://appsell.com/product?id=${this.product.id}`;
      const message = `${this.product.name}\n${this.product.price}\n\n${this.product.description}`;
      const options = {
        message,
        subject: `From AppSell: Product ${this.product.name}`,
        files: [], //c.toDataURL()
        url: `http://appsell.com/product?id=${this.product.id}`
        // chooserTitle: 'Pick an app'
      };

      this.getDataUri(this.product.downloadURL, dataUri => {
        options.files.push(dataUri);

        const onSuccess = result => {
          if (result.completed) {
            this.snackbarMessage = `Successfully shared on ${result.app}`;
            this.snackbar = true;
          }
        };

        const onError = error => {
          this.snackbarMessage = "An error occurred";
          this.snackbar = true;
        };

        window.plugins.socialsharing.shareWithOptions(
          options,
          onSuccess,
          onError
        );
      });
    },

    canShare(app, cb) {
      const onSuccess = () => {
        cb({ success: true });
      };

      const onError = () => {
        cb({ success: false });
      };

      window.plugins.socialsharing.canShareVia(
        app,
        "hello",
        null,
        null,
        null,
        onSuccess,
        onError
      );
    },

    getDataUri(url, cb) {
      var image = new Image();

      image.onload = function() {
        var canvas = document.createElement("canvas");
        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

        canvas.getContext("2d").drawImage(this, 0, 0);

        cb(canvas.toDataURL("image/png"));
      };

      image.src = url;
    },

    async fetchVariant() {
      this.attribLoading = true;
      let variantName = '';
      for(const [key, variant] of Object.entries(this.attribute)) {
        
        if(key.toLowerCase() === "quantity" || key.toLowerCase() === "qty") {
          console.log('key that disqualifies: ', key);
          continue;

        } else {
          console.log('key that qualified: ', key)
          variantName += `${variant}`;
        }
        
      }
      
      console.log('variant name generated: ', variantName);
      const variant = await this.$store.dispatch('variants/GET_VARIANT', {
        name: variantName,
        productId: this.product.id
      });
      
      this.variant = Object.assign({}, variant);
      this.attribute['quantity'] = this.variant.minimumOrder;
      
      console.log('selected variant: ', this.variant)
      
      if(!this.variant || !this.variant.hasOwnProperty('sku')) {
        this.snackbar = true;
        this.snackbarMessage = "No variant associated...";
      } 

      this.attribLoading = false;
      
    },

    addToInventory() {
      // hack to remove quantity validation

      if (!this.$refs.form.validate()) {
        return;
      }

      this.addToInventoryLoading = true;
      this.$store
        .dispatch("inventory/ADD_TO_INVENTORY", {
          attributes: this.attribute,
          inventory: Number(this.attribute["quantity"]),
          net: 0,
          productId: this.product.id,
          resellerId: null,
          unique: null
        })
        .then(res => {
          this.addToInventoryLoading = false;
          this.editItemDialog = false;

          if (res.exists) {
            this.selectedInventoryItem = res.data;
            this.$refs.ConfirmationModal.show(
              "Confirm",
              "The item is already existing in the Inventory, do you want to update it?"
            );
          } else {
            this.$refs.modal.show("Success", "Inventory has been recorded.");
          }
        });
    },

    goToInventory() {
      this.$router.push({
        name: "Inventory",
        params: {
          docRef: this.selectedInventoryItem
        }
      });
    },

    addToStockOrder() {
      if (!this.$refs.form.validate()) {
        return;
      }

      this.addToStockOrderLoading = true;

      this.attribute.quantity = Number(this.attribute.quantity);

      this.$store
        .dispatch("stock_orders/SAVE_ITEM_FROM_INVENTORY", {
          attributes: this.attribute,
          productId: this.product.id,
          variant: this.variant,
        })
        .then(res => {
          console.log("ATTRIBUTES", this.attribute);
          this.$refs.modal.show(
            "Success",
            "Order to " +
              this.$store.getters["GET_COMPANY"] +
              " has been added to your shopping cart for confirmation."
          );
        })
        .catch(error => {
          this.snackbar = true;
          this.snackbarMessage = "An error occurred";
          console.log(error);
        })
        .finally(() => {
          this.addToStockOrderLoading = false;
          this.editItemDialog = false;
          this.orderQTY = 0;
        });
    },

    cancelEdit() {
      this.editItemDialog = false;
      this.orderQTY = 0;
      this.attribute["quantity"] = 0;
    },
  },
  
  watch: {
    
  },

  computed: {
    ...mapGetters({
      GET_PRODUCTS: "products/GET_PRODUCTS",
      GET_CURRENT_CATALOGUE: "GET_CURRENT_CATALOGUE",
      variantList: "variants/GET_VARIANTS",
      user: "accounts/user"
    }),
    descriptionTemplate() {
      return this.description;
    },
    disableAddToCart() {
      if(this.variant.isOutofStock) return true;
      if(this.addToStockOrderLoading) return true;
      if(Number(this.variant.availableQTY) === 0) return true;
      if(Number(this.attribute.quantity) < Number(this.variant.minimumOrder)) return true;
      if(Number(this.attribute.quantity) < Number(this.variant.maximumOrder)) return true;
      if(Number(this.attribute.quantity) > Number(this.variant.availableQTY)) return true; 
      if(Number(this.attribute.quantity) <= 0) return true;
      
      return false;
    }
  },
  filters: {
    trunc(val) {
      const maxLength = 100; // maximum number of characters to extract

      //trim the string to the maximum length
      let trimmedString = val.substr(0, maxLength);

      //re-trim if we are in the middle of a word
      trimmedString = trimmedString.substr(
        0,
        Math.min(trimmedString.length, trimmedString.lastIndexOf(" "))
      );

      return trimmedString;
    }
  },
  components: {
    "mt-spinner": Spinner,
    // 'truncate': truncate,
    checkmark: CheckMark,
    ContactSelection,
    BottomNav,
    BasketBadge,
    SocialShare,
    Modal,
    ConfirmationModal,
    Carousel,
    Slide,
    ContactsBadge
  }
};
</script>

<style scoped>
.img-responsive {
  height: 100%;
  width: 100%;
  max-width: 100%;
}
.product-price {
  font-size: 18px;
  font-weight: 400;
}
.product-name {
  font-size: 23px;
  font-weight: 380;
}
.product-qty {
  font-size: 18px;
  font-weight: 400;
}
.product-description {
  text-align: justify;
}
.discount-img {
  position: absolute;
  top: 11%;
}

.input-group.input-group--error label {
  animation: none !important;
}

.button-font {
  font-size: 12px !important;
}

.icon-font {
  font-size: 16px;
}

.VueCarousel-slide {
  position: relative;
  background: transparent;
  text-align: center;
}
</style>
