import React from "react";
import Downshift from "downshift";

import {
  Menu,
  ControllerButton,
  Input,
  Item,
  ArrowIcon,
  XIcon,
  css,
} from "./AutocompleteComponent";

export default function CustomDownshift({ itemToString, getItems, assetType, ...rest }) {
    return (
      <Downshift itemToString={itemToString} assetType={assetType} {...rest}>
        {({
          getInputProps,
          getToggleButtonProps,
          getMenuProps,
          getItemProps,
          isOpen,
          clearSelection,
          selectedItem,
          inputValue,
          highlightedIndex,
        }) => (
          <div>
            <div {...css({ position: "relative" })}>
              <Input
                {...getInputProps({
                  isOpen,
                  placeholder: `Please write a ${assetType}..`,
                })}
              />
              {selectedItem ? (
                <ControllerButton
                  onClick={clearSelection}
                  aria-label="clear selection"
                >
                  <XIcon />
                </ControllerButton>
              ) : (
                <ControllerButton {...getToggleButtonProps()}>
                  <ArrowIcon isOpen={isOpen} />
                </ControllerButton>
              )}
            </div>
            <div {...css({ position: "relative" })}>
              <Menu {...getMenuProps()}>
                {isOpen
                  ? getItems(inputValue).map(
                      ({ value, label, comp_id }, index) => (
                        <Item
                          {...getItemProps({
                            key: comp_id,
                            item: value,
                            index,
                            isActive: highlightedIndex === index,
                            isSelected: selectedItem === value,
                          })}
                        >
                          {label}
                        </Item>
                      )
                    )
                  : null}
              </Menu>
            </div>
          </div>
        )}
      </Downshift>
    );
  }