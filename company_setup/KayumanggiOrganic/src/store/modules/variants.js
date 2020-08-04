import { DB } from '@/config/firebaseInit';

const variants = {
    namespaced: true,
    state: {
        variants: [],
        subscriber: null,
    },
    getters: {
        GET_VARIANTS: state => state.variants,
    },
    mutations: {
        ClearVariants(state) {
            state.variants = [];
        },
        AddVariant(state, payload) {
            state.variants.unshift(payload);

        },
        UpdateVariant(state, payload) {
            const index = state.variants.findIndex((variant) => variant.id === variant.id);
            if(index !== -1) {
                state.variants[index] = Object.assign({}, payload);
            }
        },
        RemoveVariant(state, payload) {
            const index = state.variants.findIndex((variant) => variant.id === payload.id);
            if(index !== -1) {
                state.variants.splice(index, 1);
            }
        }
    },
    actions: {
        async LISTEN_TO_VARIANTS({state, commit, dispatch}) {
            commit('ClearVariants');
            console.log('listening to variant changes...');
            
            state.subscriber = DB.collection('products').doc('details').collection('variants')
            .onSnapshot((snapshot) => {

                let changes = snapshot.docChanges();

                changes.forEach((change) => {
                    let data = change.doc.data();
                    data.id = change.doc.id; 

                    switch(change.type) {
                        case 'added': {
                            if(!state.variants.length) {
                                commit('AddVariant', data);
                            
                            } else {
                                //avoid pushing the same product on the list
                                const lastVariantAdded = state.variants[0];
                                if(lastVariantAdded.id !== data.id) {
                                    data.availableQTY = Number(data.onHandQTY) - Number(data.allocatedQTY);
                                    commit('AddVariant', data);
                                }
                            }

                            break;
                        }

                        case 'modified': {
                            console.log('variant was modified!', data);
                            data.availableQTY = Number(data.onHandQTY) - Number(data.allocatedQTY);
                            commit('UpdateVariant', data);
                            break;
                        }

                        case 'removed': {
                            console.log('variant was removed!', data);
                            commit('RemoveVariant', data);
                            break;
                        }

                        default: {
                            console.log('variant with unknown change type: ', data);
                        }
                    }
                });

            });
        },

        UNSUBSCRIBE_TO_VARIANTS({state}) {
            if(state.subscriber) {
                state.subscriber();
            }
        },

        async UPDATE_VARIANT({}, payload) {
            const { updatedDetails, id } = payload;
            try {
                await DB.collection('products').doc('details').collection('variants').doc(id).update(updatedDetails);

                return { isSuccessful: true };
            
            } catch(error) {
                console.log(error);
                throw error;
            }
        },

        async UPDATE_VARIANT_DETAIL({}, payload) {
            const { id, key, value } = payload;
            try {
                await DB.collection('products').doc('details').collection('variants').doc(id).update({ [key]: value });

                return { isSuccessful: true };
            
            } catch(error) {
                console.log(error);
                throw error;
            }
        },

        async GET_VARIANT({}, payload) {
			const { productId } = payload;
			try {
                let variantSnapshot;

				if(payload.hasOwnProperty('sku')) {
                    variantSnapshot = await DB.collectionGroup('variants')
					    .where('sku', '==', payload.sku)
					    .where('productId', '==', productId)
					    .get();
                
                } else if(payload.hasOwnProperty('name')) {
                    variantSnapshot = await DB.collectionGroup('variants')
					    .where('name', '==', payload.name)
					    .where('productId', '==', productId)
					    .get();
                }

				if(!variantSnapshot.empty) {
					const data = variantSnapshot.docs.map(doc => {
						const data = doc.data();

						data.availableQTY = parseInt(data.onHandQTY) - parseInt(data.allocatedQTY);
						
						if(!data.isOutofStock && data.availableQTY === 0) {	
							data.isOutofStock = true;
						}
						
						data.id = doc.id;
						return  data;
					});
					console.log('variants retrieved: ', data);
					return data[0];

				} else {
					throw new Error('no variant exists!');
				}

			} catch(error) {
				console.log('error in get_product_variant: ', error);
				throw error;
			}
        },

    }
};

export default variants;