### This file is automatically generated by Qt Design Studio.
### Do not change

add_subdirectory(R5Wallet)
add_subdirectory(R5WalletContent)
add_subdirectory(App)
add_subdirectory(Dependencies)

target_link_libraries(${CMAKE_PROJECT_NAME} PRIVATE
    R5Walletplugin
    R5WalletContentplugin)