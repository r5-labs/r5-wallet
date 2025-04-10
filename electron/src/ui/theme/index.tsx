import styled from "styled-components";

export const colorBackground =
  "radial-gradient(circle, rgba(37,55,66,1) 0%, rgba(22,34,43,1) 100%)";
export const colorBoxBackground =
  "linear-gradient(40deg, #16222B 0%, #21303A 100%)";
export const colorPrimary = "#459381";
export const colorSecondary = "#16222B";
export const colorAccent = "#0AC18E";
export const colorText = "#FFFFFF";
export const colorBorder = "#21303A";
export const colorLightBorder = "#2E3F4A";
export const colorShadow = "rgba(0, 0, 0, 0.1";

export const colorTransparent = "transparent";
export const colorBlack = "#000000";
export const colorWhite = "#FFFFFF";
export const colorExtraLightGray = "#ECECEC";
export const colorLightGray = "#C1C1C1";
export const colorGray = "#7F7F7F";
export const colorDarkGray = "#535353";
export const colorExtraDarkGray = "#535353";

export const fontSizeH1 = "52pt";
export const fontSizeH2 = "42pt";
export const fontSizeH3 = "32pt";
export const fontSizeH4 = "24pt";
export const fontSizeH5 = "18pt";
export const fontSizeH6 = "10pt";
export const fontSize = "10pt";
export const fontWeight = "normal";

export const borderNone = "none";
export const borderDefault = `1px solid ${colorBorder}`;
export const borderLight = `1px solid ${colorLightBorder}`;
export const borderRadiusDefault = "15px";
export const borderRadiusRound = "99px";
export const paddingZero = "0px";
export const paddingLow = "5px";
export const paddingDefault = "10px";
export const paddingHigh = "20px";
export const marginZero = "0px";
export const marginLow = "5px";
export const marginDefault = "10px";
export const marginHigh = "15px";
export const marginUpDownSpacing = "50px auto 50px auto";
export const defaultGap = "10px";

export const buttonWidthDefault = "auto";
export const buttonWidthFull = "100%";
export const buttonPaddingDefault = "10px 15px 10px 15px";
export const buttonBorder = `1px solid ${colorTransparent}`;
export const buttonOutlinedBorder = `1px solid ${colorPrimary}`;
export const buttonRoundSize = "48px";

export const ButtonPrimary = styled.button`
  padding: ${buttonPaddingDefault};
  margin: ${marginLow};
  width: ${buttonWidthDefault};
  font-weight: ${fontWeight};
  font-size: ${fontSizeH6};
  text-align: center;
  border-radius: ${borderRadiusRound};
  border: ${buttonBorder};
  background: ${colorPrimary};
  color: ${colorText};
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  &:hover {
    background: ${colorAccent};
  }
  &:disabled {
    cursor: pointer;
  }
  > * {
    user-select: none;
  }
`;

export const ButtonSecondary = styled.button`
  padding: ${buttonPaddingDefault};
  width: ${buttonWidthDefault};
  font-weight: ${fontWeight};
  font-size: ${fontSizeH6};
  text-align: center;
  border-radius: ${borderRadiusRound};
  border: ${buttonOutlinedBorder};
  background: ${colorTransparent};
  color: ${colorText};
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  &:hover {
    background: ${colorAccent};
  }
  &:disabled {
    cursor: pointer;
  }
  > * {
    user-select: none;
  }
`;

export const ButtonRound = styled.button`
  padding: ${paddingLow};
  width: ${buttonRoundSize};
  height: ${buttonRoundSize};
  font-weight: ${fontWeight};
  font-size: ${fontSizeH6};
  text-align: center;
  border-radius: ${borderRadiusRound};
  border: ${buttonBorder};
  background: ${colorPrimary};
  color: ${colorText};
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  &:hover {
    background: ${colorAccent};
  }
  &:disabled {
    cursor: pointer;
  }
  > * {
    user-select: none;
  }
`;

export const Link = styled.a`
  text-decoration: none;
  color: ${colorPrimary};
  &:hover {
    text-decoration: underline;
    color: ${colorAccent};
  }
`;

export const FullPageBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${paddingHigh};
  margin: 0;
  border-radius: ${borderRadiusDefault};
  border: ${borderDefault};
  background: ${colorBoxBackground};
  width: 100%;
  height: 100%;
  min-width: 320px;
  justify-content: center;
  align-items: center;
  gap: ${defaultGap};
`;

export const Box = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${paddingHigh};
  margin: 0;
  border-radius: ${borderRadiusDefault};
  border: ${borderDefault};
  background: ${colorBoxBackground};
  width: 100%;
  min-width: 320px;
  justify-content: flex-start;
  align-items: center;
  gap: ${defaultGap};
`;

export const BoxSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${paddingHigh};
`;

export const BoxContentParent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
  gap: ${defaultGap};
`;

export const BoxContent = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  align-items: center;
  gap: ${defaultGap};
`;

export const BoxHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  background: ${colorTransparent};
  padding: 0;
  margin: 0;
  width: 100%;
`;

export const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  width: auto;
  margin: -10px 0 10px 0;
  justify-content: center;
  align-items: flex-start;
  gap: 0;
`;

export const HeaderButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  background: ${colorTransparent};
  padding: 0;
  margin: 0;
  width: 100%;
`

export const Divider = styled.div`
  display: flex;
  flex-direction: column;
  background: ${colorTransparent};
  padding: ${paddingZero};
  margin: ${marginZero};
  border-bottom: ${borderLight};
  width: 100%;
`;

export const Spacer = styled.div`
  margin: 3px;
`;

export const TextHeader = styled.h2`
  font-size: ${fontSizeH2};
  margin: 0;
`;

export const TextTitle = styled.h4`
  font-size: ${fontSizeH4};
  margin: 0;
`;

export const TextSubTitle = styled.h5`
  font-size: ${fontSizeH5};
  margin: 0;
  font-weight: light;
`;

export const Text = styled.p`
  font-size: ${fontSize};
  margin: 0;
`;

export const SmallText = styled.p`
  font-size: 8pt;
  margin: 0;
`

export const Input = styled.input`
  font-size: 11pt;
  border-radius: ${borderRadiusDefault};
  padding: ${buttonPaddingDefault};
  border: ${borderDefault};
  text-align: center;
  background: ${colorSecondary};
`