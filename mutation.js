import gql from "graphql-tag";

export const ADD_ITEM = gql`
    mutation addEquipment(
        $titleRU: String!
        $titleEN: String!
        $vendorCode: Int!
        $code: String!
        $currencyId: Int!
        $basePrice: Float!
        $margin: Int
        $priceType: String!
        $groups: [Int]!
        $params: [EquipmentParam]!
        $kits: [EquipmentKit]!
    ) {
        addEquipment(
            titleRU: $titleRU
            titleEN: $titleEN
            vendorCode: $vendorCode
            code: $code
            currencyId: $currencyId
            basePrice: $basePrice
            margin: $margin
            priceType: $priceType
            groups: $groups
            params: $params
            kits: $kits
        ) {
            equipment {
                id
                titleRU
                titleEN
                vendorCode
                code
                basePrice
                margin
                priceType
                groups {
                    id
                }
                paramValues {
                    paramId
                    value
                }
                currency {
                    id
                    title
                }
                createdAt
                kits {
                    id
                    quantity
                    child {
                        id
                        titleRU
                        titleEN
                    }
                }
            }
            field
            message
        }
    }
`;

export const UPDATE_ITEM = gql`
    mutation updateEquipment(
        $id: ID!
        $titleRU: String!
        $titleEN: String!
        $vendorCode: Int!
        $code: String!
        $currencyId: Int!
        $basePrice: Float!
        $margin: Int
        $priceType: String!
        $groups: [Int]!
        $params: [EquipmentParam]!
        $kits: [EquipmentKit]!
    ) {
        updateEquipment(
            id: $id
            titleRU: $titleRU
            titleEN: $titleEN
            vendorCode: $vendorCode
            code: $code
            currencyId: $currencyId
            basePrice: $basePrice
            margin: $margin
            priceType: $priceType
            groups: $groups
            params: $params
            kits: $kits
        ) {
            equipment {
                id
                titleRU
                titleEN
                vendorCode
                code
                currency {
                    id
                    title
                }
                basePrice
                margin
                priceType
                createdAt
                kits {
                    id
                    quantity
                    child {
                        id
                        titleRU
                        titleEN
                    }
                }
            }
            field
            message
        }
    }
`;

export const DELETE_ITEM = gql`
    mutation deleteEquipment($id: ID!) {
        deleteEquipment(id: $id) {
            status
            message
        }
    }
`;
