// Generated by https://quicktype.io

export interface SFCCCategory {
    categories?:              SFCCCategory[];
    id:                       string;
    image:                    string;
    name:                     string;
    page_description?:        string;
    page_title?:              string;
    parent_category_id:       string;
    c_enableCompare:          boolean;
    c_headerMenuBanner?:      string;
    c_headerMenuOrientation?: string;
    c_showInMenu:             boolean;
    page_keywords?:           string;
    c_slotBannerImage?:       string;
    c_alternativeUrl?:        string;
}

// Generated by https://quicktype.io

export interface SFCCCustomerGroup {
    _type:           string;
    _resource_state: string;
    id:              string;
    link:            string;
}

// Generated by https://quicktype.io

export interface SFCCProduct {
    _v:                   string;
    _type:                string;
    currency:             string;
    id:                   string;
    image_groups:         ImageGroup[];
    long_description:     string;
    master:               Master;
    min_order_quantity:   number;
    name:                 string;
    page_description:     string;
    page_title:           string;
    price:                number;
    primary_category_id:  string;
    short_description:    string;
    step_quantity:        number;
    type:                 Type;
    valid_from:           ValidFrom;
    variants:             Variant[];
    variation_attributes: VariationAttribute[];
}

export interface ImageGroup {
    _type:     string;
    images:    Image[];
    view_type: string;
}

export interface Image {
    _type:         string;
    alt:           string;
    dis_base_link: string;
    link:          string;
    title:         string;
}

export interface Master {
    _type:     string;
    link:      string;
    master_id: string;
    price:     number;
}

export interface Type {
    _type:  string;
    master: boolean;
}

export interface ValidFrom {
    default: string;
}

export interface Variant {
    _type:            string;
    link:             string;
    price:            number;
    product_id:       string;
    variation_values: VariationValues;
}

export interface VariationValues {
    color: string;
    size:  string;
}

export interface VariationAttribute {
    _type:  string;
    id:     string;
    name:   string;
    values: Value[];
}

export interface Value {
    _type:     string;
    name:      string;
    orderable: boolean;
    value:     string;
}
