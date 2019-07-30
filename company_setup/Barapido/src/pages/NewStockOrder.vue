<template>
  <div>
    <v-toolbar app color="primary" dark>
      <v-btn icon @click="goBack">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-spacer v-if="$store.state.rightAlignToolbarIcons"></v-spacer>
      <!-- <BasketBadge tabName="msa" /> -->
      <v-btn icon @click="confirmGenerate" v-show="stockOrder.items.length > 0">
        <v-icon>refresh</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <Logo />
    </v-toolbar>

    <table class="basket-table" v-show="!loader">
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
              <v-flex xs4>
                <v-avatar tile size="35px">
                  <v-img :src="item.image" :alt="item.name" contain></v-img>
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
          <td class="caption text-xs-right border-bottom">{{ item.qty }}</td>
          <td class="caption text-xs-right border-bottom">
            {{ (item.qty * item.resellerPrice) | currency("P") }}
            <br />
            <a @click="editItem(item)">
              <v-icon class="caption blue--text">border_color</v-icon> Edit</a
            >
          </td>
        </tr>
        <tr>
          <td colspan="3" class="text-xs-right">
            <v-btn
              small
              color="primary"
              depressed
              @click="$router.push({ name: 'Catalogue' })"
              >Add new item</v-btn
            >
          </td>
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
            <strong>{{ total | currency("P") }}</strong>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="text-xs-center mt-5" v-show="loader">
      <v-progress-circular
        :size="100"
        :width="5"
        color="primary"
        indeterminate
      ></v-progress-circular>
    </div>

    <div class="text-xs-center mt-3 mb-3" v-show="!loader">
      <div v-if="stockOrder.items.length > 0">
        <v-btn
          @click="submitStockOrder"
          depressed
          large
          color="primary"
          class="white--text"
          :disabled="stockOrder.items.length < 1"
        >
          <span>Submit Orders to {{ $store.getters["GET_COMPANY"] }} </span>
        </v-btn>
      </div>
      <!-- <div v-else>
				<v-btn @click="generateStockOrder" depressed large color="primary" class="white--text">
					<span>Generate From Inventory</span>
				</v-btn>
			</div> -->
    </div>

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

    <v-dialog v-model="editItemDialog" persistent>
      <v-card>
        <v-card-title class="pa-0">
          <v-btn icon @click="editItemDialog = false" class="primary--text">
            <v-icon>arrow_back</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="deleteProduct" color="pink" depressed dark small>
            <v-icon left>delete_forever</v-icon> Delete</v-btn
          >
        </v-card-title>
        <v-card-text>
          <div class="text-xs-center">
            <v-avatar tile size="70px">
              <v-img :src="selectedProduct.image"></v-img>
            </v-avatar>
            <div class="title mt-4">{{ selectedProduct.name }}</div>
          </div>
          <v-text-field
            type="number"
            v-model.number="selectedProduct.qty"
            label="Quantity"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn
            :disabled="saveProductButton"
            :loading="saveProductButton"
            block
            class="primary white--text"
            @click="saveProduct"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar bottom v-model="snackbar">{{ snackbarMessage }}</v-snackbar>
    <BottomNav />
    <ConfirmationModal
      ref="ConfirmationModal"
      confirmText="Continue"
      @confirmClicked="generateStockOrder"
    />
    <ConfirmationModal ref="finalizeOrder" @confirmClicked="finalizeOrder" />
  </div>
</template>




<script>
import { mapGetters } from "vuex";
import { mixins } from "@/mixins";
import BottomNav from "@/components/BottomNav";
import BasketBadge from "@/components/BasketBadge";
import ConfirmationModal from "@/components/ConfirmationModal";

export default {
  mixins: [mixins],
  data: () => ({
    items: [],
    search: null,
    loading: false,
    loader: false,
    loaderDialog: false,
    stockOrder: {
      id: null,
      items: [],
      userId: null,
      createdAt: null
    },
    loaderDialogMessage: null,
    editItemDialog: false,
    selectedProduct: {
      qty: 0
    },
    saveProductButton: false,
    snackbar: false,
    snackbarMessage: null
  }),
  created() {
    this.cordovaBackButton(this.goBack);

    this.loader = true;
    this.loaderDialogMessage = "Getting current stock orders";
    this.$store
      .dispatch("stock_orders/GET")
      .then(res => {
        console.log(res.data);
        if (res.success) {
          this.stockOrder = Object.assign({}, res.data);
        }
      })
      .catch(error => {
        console.log(error);
      })
      .finally(() => {
        this.loaderDialogMessage = null;
        this.loader = false;
      });
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },

    confirmGenerate() {
      this.$refs.ConfirmationModal.show(
        "Confirm",
        "Refreshing this page will remove items you have manually added to this shopping cart, Do you wish to continue?"
      );
    },

    generateStockOrder() {
      this.$refs.ConfirmationModal.close();
      this.loaderDialog = true;
      this.loaderDialogMessage = "Generating stock order";
      const includeSelfOrders = false;
      this.$store
        .dispatch("orders/GET_RESELLER_ORDERS", includeSelfOrders)
        .then(data => {
          const items = data.map(order => {
            let placedOrders = order.orders.filter(
              item => item.status !== "delivered"
            );
            return placedOrders.map(item => item.basket);
          });

          let flattened_items = [].concat.apply([], items);
          flattened_items = [].concat.apply([], flattened_items);

          const orders = [];

          flattened_items.forEach(item => {
            // generate unique value based on product id and attributes
            const itemAttributesCopy = JSON.parse(
              JSON.stringify(item.attribute)
            );
            delete itemAttributesCopy.qty;
            const attributes = Object.values(itemAttributesCopy).sort();
            const unique = item.product.id + "_" + attributes.join("-");
            // generate end
            const orderIndex = orders.findIndex(o => o.unique === unique);
            if (orderIndex >= 0) {
              orders[orderIndex].orders += item.attribute.qty;
              orders[orderIndex].net =
                orders[orderIndex].inventory - orders[orderIndex].orders;
            } else {
              // generate unique value based on product id and attributes
              const itemAttributesCopy = JSON.parse(
                JSON.stringify(item.attribute)
              );
              delete itemAttributesCopy.qty;
              const attributes = Object.values(itemAttributesCopy).sort();
              const unique = item.product.id + "_" + attributes.join("-");
              // generate end
              orders.push({
                id: item.product.id,
                imageObj: item.product.imageObj,
                name: item.product.name,
                orders: item.attribute.qty,
                unique,
                attributes: item.attribute,
                inventory: 0,
                net: 0 - item.attribute.qty
              });
            }
          });

          this.$store.dispatch("inventory/GET_INVENTORY").then(res => {
            const addedItemsFromCatalogue = [];
            res.forEach(inv => {
              const productIndex = orders.findIndex(
                order => order.unique === inv.unique
              );
              if (productIndex >= 0) {
                orders[productIndex].inventory = inv.inventory;
                orders[productIndex].net =
                  inv.inventory - orders[productIndex].orders;
                orders[productIndex].inventory_id = inv.id;
              } else {
                addedItemsFromCatalogue.push(
                  this.$store
                    .dispatch("products/GET_PRODUCT", inv.productId)
                    .then(data => {
                      data.newItem = inv;
                      return data;
                    })
                );
              }
            });

            Promise.all(addedItemsFromCatalogue).then(newItems => {
              newItems.forEach(item => {
                const inv = JSON.parse(JSON.stringify(item.newItem));
                if (item.imageObj) {
                  inv.imageObj = item.imageObj;
                } else {
                  inv.downloadURL = item.downloadURL;
                }
                // inv.id = item.id;
                inv.name = item.name;
                inv.orders = 0;
                inv.inventory_id = inv.id;
                orders.push(inv);
              });

              this.loading = false;

              const negativeItems = orders
                .filter(order => order.net < 0)
                .map(order => {
                  return {
                    productId: order.id,
                    qty: Math.abs(order.net),
                    attributes: order.attributes
                  };
                });

              const obj = {
                items: negativeItems,
                createdAt: Date.now(),
                active: true
              };

              this.$store
                .dispatch("stock_orders/SAVE", obj)
                .then(res => {
                  if (res.status == "created") {
                    obj.id = res.id;
                    this.stockOrder.items = res.data.items;
                  } else if (res.status == "updated") {
                    console.log(res);

                    this.stockOrder.items = res.items;
                  }
                })
                .catch(error => {
                  console.log(error);
                })
                .finally(() => {
                  this.loaderDialog = false;
                });
            });
          });
        })
        .catch(error => {
          console.log(error);
        });
    },

    editItem(product) {
      console.log(product);
      this.selectedProduct = Object.assign({}, product);
      this.editItemDialog = true;

      console.log(this.selectedProduct);
    },

    saveProduct() {
      this.saveProductButton = true;
      this.$store
        .dispatch("stock_orders/UPDATE_ITEM", this.selectedProduct)
        .then(res => {
          if (res.success) {
            this.editItemDialog = false;
            this.snackbarMessage = res.message;
            this.snackbar = true;

            const index = this.stockOrder.items.findIndex(
              item => item.unique === this.selectedProduct.unique
            );

            if (index !== -1) {
              this.stockOrder.items[index].qty = this.selectedProduct.qty;
            }
          }
        })
        .finally(() => {
          this.saveProductButton = false;
        });
    },

    deleteProduct() {
      console.log(1);
      this.$store
        .dispatch("stock_orders/DELETE_ITEM", this.selectedProduct.unique)
        .then(res => {
          console.log(res);
          if (res.success) {
            this.editItemDialog = false;
            this.snackbarMessage = res.message;
            this.snackbar = true;

            const index = this.stockOrder.items.findIndex(
              item => item.unique === this.selectedProduct.unique
            );

            if (index !== -1) {
              this.stockOrder.items.splice(index, 1);
            }
          }
        })
        .catch(error => {
          console.log(error);
        });
    },

    submitStockOrder() {
      this.$refs.finalizeOrder.show(
        "Confirm",
        "Are you sure you want to submit these orders to " +
          this.$store.getters["GET_COMPANY"] +
          "?"
      );
    },
    finalizeOrder() {
      this.loaderDialog = true;
      this.loaderDialogMessage = "Submitting orders";

      this.$store
        .dispatch("stock_orders/SUBMIT", this.stockOrder)
        .then(res => {
          this.$router.push({
            name: "StockOrderCheckoutSuccess",
            params: {
              stockOrder: this.stockOrder,
              submittedAt: res.submittedAt
            }
          });
        })
        .catch(error => {
          console.log(error);
        });
    }
  },
  computed: {
    subTotal() {
      console.log(this.stockOrder);
      return this.stockOrder.items.reduce(
        (a, b) => a + b.resellerPrice * b.qty,
        0
      );
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
      if (this.discount) {
        return this.subTotal - (this.discount / 100) * this.subTotal;
      } else {
        return this.subTotal;
      }
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
        str += `${key}:${attributes[key]}`;
      });

      return str;
    }
  },
  components: {
    BasketBadge,
    ConfirmationModal
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
